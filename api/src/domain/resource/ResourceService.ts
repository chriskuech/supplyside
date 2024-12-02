import { Prisma } from '@prisma/client'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { BadRequestError } from '@supplyside/api/integrations/fastify/BadRequestError'
import { ConflictError } from '@supplyside/api/integrations/fastify/ConflictError'
import {
  FieldTemplate,
  Resource,
  ResourcePatch,
  ResourceType,
  ResourceTypeSchema,
  ValueInput,
  ValueResource,
  billStatusOptions,
  fields,
  getNextResourceCreationDate,
  jobStatusOptions,
  purchaseStatusOptions,
  selectResourceFieldValue,
} from '@supplyside/model'
import assert, { fail } from 'assert'
import dayjs, { Dayjs } from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js'
import { inject, injectable } from 'inversify'
import { isTruthy, map, pipe, sortBy, sum, zip } from 'remeda'
import { match } from 'ts-pattern'
import { z } from 'zod'
import { SchemaService } from '../schema/SchemaService'
import { deriveFields } from './deriveFields'
import { createSql } from './json-logic/compile'
import { JsonLogic, OrderBy } from './json-logic/types'
import {
  mapResourceModelToEntity,
  mapValueInputToPrismaValueCreate,
  mapValueInputToPrismaValueUpdate,
  mapValueToValueInput,
} from './mappers'
import { resourceInclude } from './model'
import { relations } from './relations'

dayjs.extend(isSameOrAfter)

export type ResourceFieldInput = {
  fieldId: string
  valueInput: ValueInput
}

type ResourceCopyParams = {
  accountId: string
  fromResourceId: string
  toResourceId: string
}

@injectable()
export class ResourceService {
  constructor(
    @inject(PrismaService) private readonly prisma: PrismaService,
    @inject(SchemaService) private readonly schemaService: SchemaService,
  ) {}

  async read(accountId: string, resourceId: string): Promise<Resource> {
    const model = await this.prisma.resource.findUniqueOrThrow({
      where: {
        id: resourceId,
        accountId,
      },
      include: resourceInclude,
    })

    return mapResourceModelToEntity(model)
  }

  async readByKey(accountId: string, resourceType: ResourceType, key: number) {
    const model = await this.prisma.resource.findUniqueOrThrow({
      where: {
        accountId_type_key: {
          accountId,
          type: resourceType,
          key,
        },
      },
      include: resourceInclude,
    })

    return mapResourceModelToEntity(model)
  }

  async readByTemplateId(accountId: string, templateId: string) {
    const resource = await this.prisma.resource.findFirst({
      where: { accountId, templateId },
      include: resourceInclude,
    })
    if (!resource) return null

    return mapResourceModelToEntity(resource)
  }

  async create(patch: ResourcePatch): Promise<Resource> {
    const { accountId, type } = patch.schema

    if (patch.schema.implements(fields.name) && patch.hasPatch(fields.name)) {
      const name = patch.getString(fields.name)
      if (name) {
        const matching = await this.findOne(accountId, type, {
          where: {
            '==': [{ var: fields.name.name }, name],
          },
        })

        if (matching) {
          throw new ConflictError(
            `A Resource already exists with ${fields.name.name} = ${name}`,
          )
        }
      }
    }

    const {
      _max: { key: latestKey },
    } = await this.prisma.resource.aggregate({
      where: { accountId, type },
      _max: { key: true },
    })

    const key = (latestKey ?? 0) + 1

    if (type === 'Purchase') {
      patch.setPatch(fields.poNumber, { string: key.toString() })
    }

    for (const field of patch.schema.fields) {
      if (patch.hasPatch(field)) {
        continue
      } else if (field.defaultToToday) {
        patch.setDate(field, new Date().toISOString())
      } else if (field.defaultValue) {
        patch.setPatch(
          field,
          mapValueToValueInput(field.type, field.defaultValue),
        )
      }
    }

    await deriveFields(patch)

    const model = await this.prisma.resource.create({
      data: {
        accountId,
        templateId: patch.patchedTemplateId,
        type,
        key,
        ResourceField: {
          create: patch.patchedFields.map(({ fieldId, valueInput }) => ({
            Field: { connect: { id: fieldId } },
            Value: {
              create: mapValueInputToPrismaValueCreate(
                patch.schema.getField({ fieldId }).type,
                valueInput,
              ),
            },
          })),
        },
      },
      include: resourceInclude,
    })

    const entity = mapResourceModelToEntity(model)

    patch.resource = entity

    await this.handlePatch(patch)

    return entity
  }

  async list(
    accountId: string,
    type: ResourceType,
    { where, orderBy }: { where?: JsonLogic; orderBy?: OrderBy[] } = {},
  ): Promise<Resource[]> {
    const schema = await this.schemaService.readSchema(accountId, type)
    const sql = createSql({ accountId, schema, where, orderBy })

    const results: { _id: string }[] = await this.prisma.$queryRawUnsafe(sql)

    const models = await this.prisma.resource.findMany({
      where: {
        accountId,
        type,
        id: {
          in: results.map((row) => row._id),
        },
      },
      include: resourceInclude,
      orderBy: [{ key: 'desc' }],
    })

    return models.map(mapResourceModelToEntity)
  }

  async findOne(
    accountId: string,
    type: ResourceType,
    { where }: { where?: JsonLogic } = {},
  ): Promise<Resource | undefined> {
    const schema = await this.schemaService.readSchema(accountId, type)
    const sql = createSql({ accountId, schema, where, take: 1 })

    const [result, unexpectedResult]: { _id: string }[] =
      await this.prisma.$queryRawUnsafe(sql)

    if (unexpectedResult) {
      throw new Error('Unexpected result')
    }

    if (!result) return undefined

    return await this.read(accountId, result._id)
  }

  async update(patch: ResourcePatch) {
    const resource = patch.resource ?? fail('Resource is required')

    await deriveFields(patch)

    if (patch.schema.implements(fields.name) && patch.hasPatch(fields.name)) {
      const name = patch.getString(fields.name)
      if (name) {
        const matching = await this.findOne(
          patch.schema.accountId,
          patch.schema.type,
          {
            where: {
              '==': [{ var: fields.name.name }, name],
            },
          },
        )

        if (matching && matching.id !== resource.id) {
          throw new ConflictError(
            `A Resource already exists with ${fields.name.name} = ${name}`,
          )
        }
      }
    }

    if (
      resource.templateId &&
      patch.patchedFields.some((f) => patch.schema.getField(f)?.templateId)
    ) {
      throw new BadRequestError(
        "Can't update a system value on a system resource",
      )
    }

    await Promise.all(
      patch.patchedFields.map(async ({ fieldId, valueInput }) => {
        const { type } = patch.schema.getField({ fieldId })

        await this.prisma.resourceField.upsert({
          where: {
            resourceId_fieldId: {
              resourceId: resource.id,
              fieldId,
            },
          },
          create: {
            Resource: {
              connect: { id: resource.id },
            },
            Field: {
              connect: { id: fieldId },
            },
            Value: {
              create: mapValueInputToPrismaValueCreate(type, valueInput),
            },
          },
          update: {
            Value: {
              upsert: {
                create: mapValueInputToPrismaValueCreate(type, valueInput),
                update: mapValueInputToPrismaValueUpdate(type, valueInput),
              },
            },
          },
        })
      }),
    )

    await Promise.all(
      patch.costs?.map((cost) =>
        cost.id
          ? this.prisma.cost.update({
              where: { resourceId: resource.id, id: cost.id },
              data: {
                resourceId: resource.id,
                name: cost.name,
                isPercentage: cost.isPercentage,
                value: cost.value,
              },
            })
          : this.prisma.cost.create({
              data: {
                resourceId: resource.id,
                name: cost.name,
                isPercentage: cost.isPercentage,
                value: cost.value,
              },
            }),
      ) ?? [],
    )

    const entity = await this.read(resource.accountId, resource.id)

    patch.resource = entity

    await this.handlePatch(patch)

    return entity
  }

  async delete(accountId: string, resourceId: string): Promise<void> {
    const resource = await this.prisma.resource.findUniqueOrThrow({
      where: { id: resourceId, accountId },
      include: resourceInclude,
    })

    const entity = mapResourceModelToEntity(resource)

    if (entity.type === 'Job') {
      const parts = await this.list(accountId, 'Part', {
        where: {
          '==': [{ var: fields.job.name }, resourceId],
        },
      })

      await Promise.all(parts.map((part) => this.delete(accountId, part.id)))
    }

    await this.prisma.resource.delete({
      where: { id: resourceId, accountId },
    })

    if (entity.type === 'PurchaseLine') {
      const purchaseId = selectResourceFieldValue(entity, fields.purchase)
        ?.resource?.id
      if (purchaseId) {
        await this.recalculateSubtotalCost(accountId, 'Purchase', purchaseId)
      }

      const billId = selectResourceFieldValue(entity, fields.bill)?.resource?.id
      if (billId) {
        await this.recalculateSubtotalCost(accountId, 'Bill', billId)
      }
    }
  }

  async withCreatePatch(
    accountId: string,
    resourceType: ResourceType,
    fn: (patch: ResourcePatch) => void | Promise<void>,
  ) {
    const schema = await this.schemaService.readSchema(accountId, resourceType)
    const patch = new ResourcePatch(schema)

    await fn(patch)

    return await this.create(patch)
  }

  async withUpdatePatch(
    accountId: string,
    resourceId: string,
    fn: (patch: ResourcePatch) => void | Promise<void>,
  ) {
    const resource = await this.read(accountId, resourceId)
    const schema = await this.schemaService.readSchema(accountId, resource.type)
    const patch = new ResourcePatch(schema, resource)

    await fn(patch)

    return await this.update(patch)
  }

  async findResourcesByNameOrPoNumber(
    accountId: string,
    resourceType: ResourceType,
    {
      input,
      exact,
      take = 15,
    }: { input: string; exact?: boolean; take?: number },
  ): Promise<ValueResource[]> {
    const results = await this.prisma.$queryRaw`
    WITH "View" AS (
      SELECT
        "Resource".*,
        "Value"."string" AS "name"
      FROM "Resource"
      LEFT JOIN "ResourceField" ON "Resource".id = "ResourceField"."resourceId"
      LEFT JOIN "Field" ON "ResourceField"."fieldId" = "Field".id
      LEFT JOIN "Value" ON "ResourceField"."valueId" = "Value".id
      WHERE "Resource"."type" = ${resourceType}::"ResourceType"
        AND "Resource"."accountId" = ${accountId}::"uuid"
        AND "Field"."templateId" IN (${fields.name.templateId}::uuid, ${
          fields.poNumber.templateId
        }::uuid)
        AND "Value"."string" <> ''
        AND "Value"."string" IS NOT NULL
    )
    SELECT "id", "type", "key", "name", "templateId"
    FROM "View"
    ${
      exact
        ? Prisma.sql`WHERE "name" = ${input}`
        : Prisma.sql`WHERE "name" ILIKE '%' || ${input} || '%' OR "name" % ${input} -- % operator uses pg_trgm for similarity matching`
    }
    ORDER BY similarity("name", ${input}) DESC
    LIMIT ${take}
  `

    return z
      .object({
        id: z.string(),
        type: ResourceTypeSchema,
        name: z.string(),
        key: z.number(),
        templateId: z.string().nullable(),
      })
      .array()
      .parse(results)
  }

  async recalculateItemizedCosts(accountId: string, resourceId: string) {
    await this.withUpdatePatch(accountId, resourceId, (patch) => {
      const subtotal = patch.getNumber(fields.subtotalCost) ?? 0

      patch.setNumber(
        fields.itemizedCosts,
        pipe(
          patch.costs,
          map((cost) =>
            cost.isPercentage ? (cost.value * subtotal) / 100 : cost.value,
          ),
          sum(),
        ),
      )
    })
  }

  async recalculateSubtotalCost(
    accountId: string,
    resourceType: ResourceType,
    resourceId: string,
  ) {
    const lines = await this.list(
      accountId,
      resourceType === 'Job' ? 'Part' : 'PurchaseLine',
      {
        where: {
          '==': [{ var: resourceType }, resourceId],
        },
      },
    )

    const subTotal = pipe(
      lines,
      map(
        (line) => selectResourceFieldValue(line, fields.totalCost)?.number ?? 0,
      ),
      sum(),
    )

    await this.withUpdatePatch(accountId, resourceId, (patch) => {
      patch.setNumber(fields.subtotalCost, subTotal)
    })
  }

  private async handlePatch(patch: ResourcePatch) {
    const resourceId = patch.resource?.id ?? fail('Patch is missing resourceId')
    const { accountId, type } = patch.schema

    // recalculate subtotal cost for parent resources
    await Promise.all(
      [fields.bill, fields.job, fields.purchase].map(async (link) => {
        assert(link.resourceType)

        if (
          !patch.schema.implements(fields.totalCost, link) ||
          !patch.hasAnyPatch(fields.totalCost, link)
        )
          return

        const resourceId = patch.getResourceId(link)
        if (!resourceId) return

        await this.recalculateSubtotalCost(
          accountId,
          link.resourceType,
          resourceId,
        )
      }),
    )

    // sync completed from purchase to steps
    if (
      type === 'Purchase' &&
      patch.hasOption(fields.purchaseStatus, purchaseStatusOptions.received)
    ) {
      const purchaseSteps = await this.list(accountId, 'Step', {
        where: {
          '==': [{ var: fields.purchase.name }, resourceId],
        },
      })

      await Promise.all(
        purchaseSteps.map((step) =>
          this.withUpdatePatch(accountId, step.id, (patch) => {
            patch.setBoolean(fields.completed, true)
          }),
        ),
      )
    }

    // sync need date from step to purchase
    await (async () => {
      if (type !== 'Step' || !patch.hasPatch(fields.deliveryDate)) return

      const purchaseId = patch.getResourceId(fields.purchase)
      const deliveryDate = patch.getDate(fields.deliveryDate)

      if (!purchaseId || !deliveryDate) return

      await this.withUpdatePatch(accountId, purchaseId, (patch) => {
        patch.setDate(fields.needDate, deliveryDate)
      })
    })()

    // copy operations from work center to step
    await (async () => {
      if (type !== 'Step' || !patch.hasPatch(fields.workCenter)) return

      const workCenterId = patch.getResourceId(fields.workCenter)
      if (!workCenterId) return

      const operations = await this.list(accountId, 'Operation', {
        where: {
          '==': [{ var: fields.workCenter.name }, workCenterId],
        },
      })

      for (const operation of operations) {
        const name = selectResourceFieldValue(
          operation,
          fields.operationName,
        )?.string
        const sequenceNumber = selectResourceFieldValue(
          operation,
          fields.sequenceNumber,
        )?.number

        await this.withCreatePatch(accountId, 'Operation', (patch) => {
          patch.setResourceId(fields.step, resourceId)
          if (name) patch.setString(fields.operationName, name)
          if (sequenceNumber)
            patch.setNumber(fields.sequenceNumber, sequenceNumber)
        })
      }
    })()

    // reschedule steps
    await (async () => {
      if (type === 'Step' && patch.hasPatch(fields.productionDays)) {
        const productionDays = patch.getNumber(fields.productionDays)
        if (!productionDays) return

        const partId = patch.getResourceId(fields.part)
        if (!partId) return

        await this.rescheduleSteps(accountId, partId)
      }

      if (type === 'Part' && patch.hasPatch(fields.needDate)) {
        const needDate = patch.getDate(fields.needDate)
        if (!needDate) return

        const partId = patch.resource?.id
        if (!partId) return

        await this.rescheduleSteps(accountId, partId)
      }
    })()

    // sync start date and delivery date to parent resources
    await (async () => {
      if (
        type === 'Step' &&
        patch.hasAnyPatch(fields.startDate, fields.deliveryDate)
      ) {
        const startDate = patch.getDate(fields.startDate)
        if (!startDate) return

        const partId = patch.getResourceId(fields.part)
        if (!partId) return

        const steps = await this.list(accountId, 'Step', {
          where: {
            '==': [{ var: fields.part.name }, partId],
          },
        })

        const minStartDate =
          steps
            .map((s) => selectResourceFieldValue(s, fields.startDate)?.date)
            .filter(isTruthy)
            .sort()
            .at(0) ?? null
        const maxDeliveryDate =
          steps
            .map((s) => selectResourceFieldValue(s, fields.deliveryDate)?.date)
            .filter(isTruthy)
            .sort()
            .at(-1) ?? null

        await this.withUpdatePatch(accountId, partId, (patch) => {
          patch.setDate(fields.startDate, minStartDate)
          patch.setDate(fields.deliveryDate, maxDeliveryDate)
        })
      }

      if (
        type === 'Part' &&
        patch.hasAnyPatch(fields.startDate, fields.deliveryDate)
      ) {
        const startDate = patch.getDate(fields.startDate)
        if (!startDate) return

        const jobId = patch.getResourceId(fields.job)
        if (!jobId) return

        const parts = await this.list(accountId, 'Part', {
          where: {
            '==': [{ var: fields.job.name }, jobId],
          },
        })

        const minStartDate =
          parts
            .map((p) => selectResourceFieldValue(p, fields.startDate)?.date)
            .filter(isTruthy)
            .sort()
            .at(0) ?? null

        const maxDeliveryDate =
          parts
            .map((p) => selectResourceFieldValue(p, fields.deliveryDate)?.date)
            .filter(isTruthy)
            .sort()
            .at(-1) ?? null

        await this.withUpdatePatch(accountId, jobId, (patch) => {
          patch.setDate(fields.startDate, minStartDate)
          patch.setDate(fields.deliveryDate, maxDeliveryDate)
        })
      }
    })()

    // sync children
    await Promise.all(
      relations
        .filter(
          (r) =>
            r.syncType === 'sync' &&
            r.parent === patch.schema.type &&
            patch.hasAnyPatch(...r.syncedFields),
        )
        .map(async (r) => {
          const children = await this.list(accountId, r.child, {
            where: {
              '==': [{ var: r.link.name }, resourceId],
            },
          })

          await Promise.all(
            children.map(({ accountId, id }) =>
              this.withUpdatePatch(accountId, id, (childPatch) =>
                r.syncedFields
                  .map((f) => patch.getPatch(f))
                  .filter((f) => !!f)
                  .forEach(({ fieldId, valueInput }) =>
                    childPatch.setPatch({ fieldId }, valueInput),
                  ),
              ),
            ),
          )
        }),
    )
  }

  async cloneResource(accountId: string, resourceId: string) {
    const source = await this.read(accountId, resourceId)

    const destination = await match(source.type)
      .with('Bill', async () => {
        const destination = await this.withCreatePatch(
          accountId,
          source.type,
          (patch) => {
            for (const {
              fieldId,
              templateId,
              fieldType,
              value,
            } of source.fields) {
              if (
                [
                  fields.parentClonedBill.templateId,
                  fields.parentRecurrentBill.templateId,
                  fields.billStatus.templateId,
                ].includes(templateId as string)
              )
                continue

              patch.setPatch(
                { fieldId },
                mapValueToValueInput(fieldType, value),
              )
            }

            patch.setOption(fields.billStatus, billStatusOptions.draft)
            patch.setResourceId(fields.parentClonedBill, resourceId)
          },
        )

        await Promise.all([
          this.cloneLines({
            resourceType: 'Bill',
            accountId,
            fromResourceId: source.id,
            toResourceId: destination.id,
            backLinkFieldRef: fields.bill,
          }),
          this.cloneCosts({
            accountId,
            fromResourceId: source.id,
            toResourceId: destination.id,
          }),
        ])

        return destination
      })
      .with('Purchase', async () => {
        const destination = await this.withCreatePatch(
          accountId,
          source.type,
          (patch) => {
            for (const {
              fieldId,
              templateId,
              fieldType,
              value,
            } of source.fields) {
              if (templateId === fields.purchaseStatus.templateId) continue

              patch.setPatch(
                { fieldId },
                mapValueToValueInput(fieldType, value),
              )
            }

            patch.setOption(fields.purchaseStatus, purchaseStatusOptions.draft)
          },
        )

        await Promise.all([
          this.cloneLines({
            resourceType: 'Purchase',
            accountId,
            fromResourceId: source.id,
            toResourceId: destination.id,
            backLinkFieldRef: fields.purchase,
          }),
          this.cloneCosts({
            accountId,
            fromResourceId: source.id,
            toResourceId: destination.id,
          }),
        ])

        return destination
      })
      .with('Job', async () => {
        const destination = await this.withCreatePatch(
          accountId,
          source.type,
          (patch) => {
            const jobStatusField = patch.schema.getField(fields.jobStatus)

            for (const { fieldId, fieldType, value } of source.fields) {
              if (fieldId === jobStatusField.fieldId) continue

              patch.setPatch(
                { fieldId },
                mapValueToValueInput(fieldType, value),
              )
            }

            patch.setOption(
              { fieldId: jobStatusField.fieldId },
              jobStatusOptions.draft,
            )
          },
        )

        await Promise.all([
          this.cloneLines({
            resourceType: 'Job',
            accountId,
            fromResourceId: source.id,
            toResourceId: destination.id,
            backLinkFieldRef: fields.job,
          }),
          this.cloneCosts({
            accountId,
            fromResourceId: source.id,
            toResourceId: destination.id,
          }),
        ])

        return destination
      })
      .otherwise(
        async () =>
          await this.withCreatePatch(accountId, source.type, (patch) => {
            for (const { fieldId, fieldType, value } of source.fields) {
              patch.setPatch(
                { fieldId },
                mapValueToValueInput(fieldType, value),
              )
            }
          }),
      )

    return destination
  }

  async cloneCosts({
    accountId,
    fromResourceId,
    toResourceId,
  }: ResourceCopyParams) {
    const fromCosts = await this.prisma.cost.findMany({
      where: { resourceId: fromResourceId, Resource: { accountId } },
      orderBy: {
        createdAt: 'asc',
      },
    })

    await this.prisma.cost.deleteMany({
      where: { resourceId: toResourceId, Resource: { accountId } },
    })

    await this.prisma.cost.createMany({
      data: fromCosts.map(({ name, isPercentage, value }) => ({
        resourceId: toResourceId,
        name,
        isPercentage,
        value,
      })),
    })
  }

  private async cloneLines({
    accountId,
    fromResourceId,
    toResourceId,
    backLinkFieldRef,
    resourceType,
  }: ResourceCopyParams & {
    backLinkFieldRef: FieldTemplate
    resourceType: ResourceType
  }) {
    const lineResourceType = resourceType === 'Job' ? 'Part' : 'PurchaseLine'
    const lineSchema = await this.schemaService.readSchema(
      accountId,
      lineResourceType,
    )

    const backLinkField = lineSchema.getField(backLinkFieldRef)

    const lines = await this.list(accountId, lineResourceType, {
      where: {
        '==': [{ var: backLinkField.name }, fromResourceId],
      },
    })

    // `createResource` is not (currently) parallelizable
    for (const line of lines) {
      await this.withCreatePatch(accountId, lineResourceType, (patch) => {
        for (const { fieldId, fieldType, value } of line.fields) {
          if (backLinkField.fieldId === fieldId) continue

          patch.setPatch({ fieldId }, mapValueToValueInput(fieldType, value))
        }
        patch.setResourceId(backLinkField, toResourceId)
      })
    }
  }

  async copyFields(
    accountId: string,
    resourceId: string,
    data: {
      fromResourceId: string
    },
  ) {
    const [fromResource, toResource] = await Promise.all([
      this.read(accountId, data.fromResourceId),
      this.read(accountId, resourceId),
    ])

    const [fromSchema, toSchema] = await Promise.all([
      this.schemaService.readSchema(accountId, fromResource.type),
      this.schemaService.readSchema(accountId, toResource.type),
    ])

    const fieldsToUpdate = fromResource.fields
      .filter((rf) => fromSchema.implements(rf))
      .map((rf) => ({
        rf,
        sf: fromSchema.getField(rf),
      }))
      .filter(({ sf }) => toSchema.implements(sf))
      .filter(
        ({ sf: { template } }) =>
          !template?.isDerived &&
          template?.templateId !== fields.name.templateId,
      )

    await this.withUpdatePatch(accountId, resourceId, (patch) => {
      for (const { rf, sf } of fieldsToUpdate) {
        patch.setPatch(sf, rf.value)
      }
    })
  }

  async createRecurringResources(accountId: string) {
    const activeRecurringBills = await this.list(accountId, 'Bill', {
      where: {
        and: [
          { '==': [{ var: fields.recurring.name }, true] },
          { '!=': [{ var: fields.recurrenceStartedAt.name }, null] },
        ],
      },
    })

    if (!activeRecurringBills.length) return

    // `Resource.key` is (currently) created transactionally and thus not parallelizable
    for (const recurringBill of activeRecurringBills) {
      const newResourcesCreationDates = []

      let nextCreationDate = getNextResourceCreationDate(recurringBill)

      while (nextCreationDate && !nextCreationDate.isAfter(dayjs(), 'day')) {
        newResourcesCreationDates.push(nextCreationDate.clone())
        nextCreationDate = getNextResourceCreationDate(
          recurringBill,
          nextCreationDate,
        )
      }

      // `Resource.key` is (currently) created transactionally and thus not parallelizable
      for (const date of newResourcesCreationDates) {
        await this.createRecurringResource(accountId, recurringBill.id, date)
      }
    }
  }

  async createRecurringResource(
    accountId: string,
    recurringResourceId: string,
    creationDate: Dayjs,
  ) {
    const source = await this.read(accountId, recurringResourceId)
    const recurringFieldsTemplateIds = [
      fields.recurring.templateId,
      fields.recurrenceInterval.templateId,
      fields.recurrenceIntervalOffsetInDays.templateId,
      fields.recurrenceIntervalUnits.templateId,
      fields.recurrenceStartedAt.templateId,
      fields.recurrenceLastExecutionDate.templateId,
    ]

    const destination = await match(source.type)
      .with('Bill', async () => {
        const destination = await this.withCreatePatch(
          accountId,
          source.type,
          (patch) => {
            for (const {
              fieldId,
              fieldType,
              templateId,
              value,
            } of source.fields) {
              if (
                [
                  ...recurringFieldsTemplateIds,
                  fields.billStatus.templateId,
                  fields.invoiceDate.templateId,
                ].includes(templateId as string)
              )
                continue

              patch.setPatch(
                { fieldId },
                mapValueToValueInput(fieldType, value),
              )
            }

            patch.setOption(fields.billStatus, billStatusOptions.draft)
            patch.setDate(fields.invoiceDate, creationDate.toISOString())
            patch.setResourceId(fields.parentRecurrentBill, recurringResourceId)
          },
        )

        await Promise.all([
          this.cloneLines({
            resourceType: 'Bill',
            accountId,
            fromResourceId: source.id,
            toResourceId: destination.id,
            backLinkFieldRef: fields.bill,
          }),
          this.cloneCosts({
            accountId,
            fromResourceId: source.id,
            toResourceId: destination.id,
          }),
        ])

        await this.withUpdatePatch(accountId, recurringResourceId, (patch) => {
          patch.setDate(
            fields.recurrenceLastExecutionDate,
            creationDate.toISOString(),
          )
        })

        return destination
      })
      .otherwise(() => fail('Recurring resource type not supported'))

    return destination
  }

  private async rescheduleSteps(accountId: string, partId: string) {
    const [part, unorderedSteps] = await Promise.all([
      this.read(accountId, partId),
      this.list(accountId, 'Step', {
        where: { '==': [{ var: fields.part.name }, partId] },
      }),
    ])

    const needDateString = selectResourceFieldValue(part, fields.needDate)?.date
    if (!needDateString) return
    const needDate = dayjs(needDateString)

    type Step = {
      id: string
      startDate: Dayjs | undefined
      productionDays: number
      deliveryDate: Dayjs | undefined
    }

    const currentSteps: Step[] = pipe(
      unorderedSteps,
      map((step) => {
        const startDate = selectResourceFieldValue(step, fields.startDate)?.date
        const productionDays = selectResourceFieldValue(
          step,
          fields.productionDays,
        )?.number
        const deliveryDate = selectResourceFieldValue(
          step,
          fields.deliveryDate,
        )?.date

        return {
          id: step.id,
          startDate: startDate ? dayjs(startDate) : undefined,
          productionDays: productionDays ?? 0,
          deliveryDate: deliveryDate ? dayjs(deliveryDate) : undefined,
        }
      }),
      sortBy((step) => step.deliveryDate?.toISOString() ?? ''),
    )

    const { steps: updatedSteps } = currentSteps.reduceRight(
      ({ steps, deadline }, step) => {
        const startDate = deadline.subtract(step.productionDays, 'day')
        const deliveryDate = deadline

        return {
          steps: [...steps, { ...step, startDate, deliveryDate }],
          deadline: startDate,
        }
      },
      { steps: [] as Step[], deadline: needDate },
    )

    await Promise.all(
      zip(currentSteps, updatedSteps)
        .filter(
          ([currentStep, updatedStep]) =>
            currentStep.startDate !== updatedStep.startDate ||
            currentStep.deliveryDate !== updatedStep.deliveryDate,
        )
        .map(([, updatedStep]) => updatedStep)
        .map(
          async (step) =>
            await this.withUpdatePatch(accountId, step.id, (patch) => {
              patch.setDate(
                fields.startDate,
                step.startDate?.toISOString() ?? null,
              )
              patch.setDate(
                fields.deliveryDate,
                step.deliveryDate?.toISOString() ?? null,
              )
            }),
        ),
    )
  }
}
