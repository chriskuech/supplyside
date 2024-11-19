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
  intervalUnits,
  jobStatusOptions,
  purchaseStatusOptions,
  selectResourceFieldValue,
} from '@supplyside/model'
import { fail } from 'assert'
import dayjs, { Dayjs } from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js'
import { inject, injectable } from 'inversify'
import { isNullish, map, pipe, sum } from 'remeda'
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

    deriveFields(patch)

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

    await this.handleResourceUpdate(patch)

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

    deriveFields(patch)

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

    await this.handleResourceUpdate(patch)

    return entity
  }

  async delete(accountId: string, resourceId: string): Promise<void> {
    const model = await this.prisma.resource.delete({
      where: { id: resourceId, accountId },
      include: resourceInclude,
    })

    const entity = mapResourceModelToEntity(model)
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

  private async handleResourceUpdate(patch: ResourcePatch) {
    const resource = patch.resource ?? fail('Resource is required')
    const { accountId, type } = patch.schema

    const relations = [
      {
        from: 'Bill',
        to: 'PurchaseLine',
        backlink: fields.bill,
        fields: [],
        lines: true,
      },
      {
        from: 'Customer',
        to: 'Job',
        backlink: fields.customer,
        fields: [fields.paymentTerms, fields.paymentMethod, fields.poRecipient],
        lines: false,
      },
      {
        from: 'Job',
        to: 'Part',
        backlink: fields.job,
        fields: [fields.customer, fields.needDate],
        lines: true,
      },
      {
        from: 'Purchase',
        to: 'PurchaseLine',
        backlink: fields.purchase,
        fields: [fields.needDate, fields.vendor],
        lines: true,
      },
      {
        from: 'Vendor',
        to: 'Purchase',
        backlink: fields.vendor,
        fields: [fields.paymentTerms, fields.paymentMethod, fields.poRecipient],
        lines: false,
      },
    ] as const

    await Promise.all([
      ...relations
        .filter(({ from }) => from === type)
        .map(async ({ to, backlink, fields }) => {
          const children = await this.list(accountId, to, {
            where: {
              '==': [{ var: backlink.name }, resource.id],
            },
          })
          for (const child of children) {
            await this.withUpdatePatch(accountId, child.id, (childPatch) => {
              for (const field of fields) {
                const fieldPatch = patch.getPatch(field)
                if (fieldPatch) {
                  const { fieldId, valueInput } = fieldPatch
                  childPatch.setPatch({ fieldId }, valueInput)
                }
              }
            })
          }
        }),
      ...relations
        .filter(({ to }) => to === type)
        .map(async ({ from, backlink, fields, lines }) => {
          if (patch.hasPatch(backlink)) {
            const parentId = patch.getResourceId(backlink)
            if (parentId) {
              await this.withUpdatePatch(accountId, parentId, (childPatch) => {
                for (const field of fields) {
                  const fieldPatch = patch.getPatch(field)
                  if (fieldPatch) {
                    const { fieldId, valueInput } = fieldPatch
                    childPatch.setPatch({ fieldId }, valueInput)
                  }
                }
              })
              if (lines) {
                await this.recalculateSubtotalCost(accountId, from, parentId)
              }
            }
          }
        }),
    ])
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

    const bills = await this.list(accountId, 'Bill', {
      where: { '==': [{ var: fields.recurring.name }, false] },
    })

    const orderedBillsByLatest = bills.sort((bill1, bill2) =>
      dayjs(bill1.createdAt).isAfter(dayjs(bill2.createdAt)) ? -1 : 1,
    )

    await Promise.all(
      activeRecurringBills.map(async (recurringBill) => {
        const recurrenceStartedAt = selectResourceFieldValue(
          recurringBill,
          fields.recurrenceStartedAt,
        )?.date
        const recurrenceInterval = selectResourceFieldValue(
          recurringBill,
          fields.recurrenceInterval,
        )?.number
        const recurrenceIntervalOffsetInDays = selectResourceFieldValue(
          recurringBill,
          fields.recurrenceIntervalOffsetInDays,
        )?.number
        const recurrenceIntervalUnitTemplateId = selectResourceFieldValue(
          recurringBill,
          fields.recurrenceIntervalUnits,
        )?.option?.templateId

        if (
          isNullish(recurrenceInterval) ||
          isNullish(recurrenceIntervalUnitTemplateId)
        )
          return

        const lastCreatedResource = orderedBillsByLatest.find(
          (bill) =>
            selectResourceFieldValue(bill, fields.parentRecurrentBill)?.resource
              ?.id === recurringBill.id,
        )

        const startDate =
          lastCreatedResource &&
          dayjs(lastCreatedResource.createdAt).isAfter(
            dayjs(recurrenceStartedAt),
          )
            ? lastCreatedResource.createdAt
            : recurrenceStartedAt

        const getNextCreationDate = (date: Dayjs) => {
          return match(recurrenceIntervalUnitTemplateId)
            .with(intervalUnits.days.templateId, () =>
              date.add(recurrenceInterval, 'day'),
            )
            .with(intervalUnits.weeks.templateId, () =>
              date
                .add(recurrenceInterval, 'week')
                .set('day', recurrenceIntervalOffsetInDays ?? 0),
            )
            .with(intervalUnits.months.templateId, () =>
              date
                .add(recurrenceInterval, 'month')
                .set('date', recurrenceIntervalOffsetInDays ?? 0),
            )
            .otherwise(() => fail('Interval unit option not supported'))
        }

        const newResourcesCreationDates = []

        let nextCreationDate = getNextCreationDate(dayjs(startDate))

        while (!nextCreationDate.isSameOrAfter(dayjs(), 'day')) {
          newResourcesCreationDates.push(nextCreationDate)
          nextCreationDate = getNextCreationDate(nextCreationDate)
        }

        // `Resource.key` is (currently) created transactionally and thus not parallelizable
        for (const date of newResourcesCreationDates) {
          await this.createRecurringResource(accountId, recurringBill.id, date)
        }
      }),
    )
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
                return

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

        return destination
      })
      .otherwise(() => fail('Recurring resource type not supported'))

    return destination
  }
}
