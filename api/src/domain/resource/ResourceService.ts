import { Prisma } from '@prisma/client'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { BadRequestError } from '@supplyside/api/integrations/fastify/BadRequestError'
import { ConflictError } from '@supplyside/api/integrations/fastify/ConflictError'
import {
  Cost,
  FieldTemplate,
  Resource,
  ResourcePatch,
  ResourceType,
  ResourceTypeSchema,
  ValueInput,
  ValueResource,
  billStatusOptions,
  fields,
  findTemplateField,
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

  async create(
    accountId: string,
    type: ResourceType,
    input: {
      templateId?: string
      fields?: ResourceFieldInput[]
      costs?: Cost[]
    },
    userId?: string,
  ): Promise<Resource> {
    const schema = await this.schemaService.readSchema(accountId, type)

    const patch = new ResourcePatch(schema)

    for (const { fieldId, valueInput } of input.fields ?? []) {
      patch.setPatch({ fieldId }, valueInput)
    }

    for (const cost of input.costs ?? []) {
      patch.addCost(cost)
    }

    if (patch.hasPatch(fields.name)) {
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

    if (patch.schema.implements(fields.assignee)) {
      patch.setPatch(fields.assignee, { userId })
    }

    for (const { fieldId } of schema.schema.fields) {
      if (patch.hasPatch({ fieldId })) {
        const field = schema.getField({ fieldId })
        if (field.defaultToToday) {
          patch.setPatch({ fieldId }, { date: new Date().toISOString() })
        } else if (field.defaultValue) {
          patch.setPatch({ fieldId }, field.defaultValue)
        }
      }
    }

    deriveFields(patch)

    const model = await this.prisma.resource.create({
      data: {
        accountId,
        templateId: input.templateId,
        type,
        key,
        ResourceField: {
          create: patch.patchedFields.map(({ fieldId, valueInput }) => ({
            Field: { connect: { id: fieldId } },
            Value: {
              create: mapValueInputToPrismaValueCreate(
                schema.getField({ fieldId }).type,
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

  async update(
    accountId: string,
    resourceId: string,
    input: { fields?: ResourceFieldInput[]; costs?: Cost[] },
  ) {
    const resource = await this.read(accountId, resourceId)
    const schema = await this.schemaService.readSchema(accountId, resource.type)

    const patch = new ResourcePatch(schema, resource)

    for (const { fieldId, valueInput } of input.fields ?? []) {
      patch.setPatch({ fieldId }, valueInput)
    }

    for (const cost of input.costs ?? []) {
      patch.addCost(cost)
    }

    deriveFields(patch)

    if (patch.hasPatch(fields.name)) {
      const name = patch.getString(fields.name)
      if (name) {
        const matching = await this.findOne(accountId, resource.type, {
          where: {
            '==': [{ var: fields.name.name }, name],
          },
        })

        if (matching && matching.id !== resourceId) {
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
        const { type } = schema.getField({ fieldId })

        await this.prisma.resourceField.upsert({
          where: {
            resourceId_fieldId: {
              resourceId,
              fieldId,
            },
          },
          create: {
            Resource: {
              connect: { id: resourceId },
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
              where: { resourceId, id: cost.id },
              data: {
                resourceId,
                name: cost.name,
                isPercentage: cost.isPercentage,
                value: cost.value,
              },
            })
          : this.prisma.cost.create({
              data: {
                resourceId,
                name: cost.name,
                isPercentage: cost.isPercentage,
                value: cost.value,
              },
            }),
      ) ?? [],
    )

    const entity = await this.read(accountId, resourceId)

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

  async updateResourceField(
    accountId: string,
    resourceType: ResourceType,
    resourceId: string,
    fieldTemplate: FieldTemplate,
    valueInput: ValueInput,
  ) {
    const schema = await this.schemaService.readSchema(accountId, resourceType)

    return await this.update(accountId, resourceId, {
      fields: [
        {
          fieldId: schema.getField(fieldTemplate).fieldId,
          valueInput,
        },
      ],
    })
  }

  async updateTemplateId(
    accountId: string,
    resourceId: string,
    { templateId }: { templateId: string | null },
  ) {
    await this.prisma.resource.update({
      where: { id: resourceId, accountId },
      data: { templateId },
    })
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

  async recalculateItemizedCosts(
    accountId: string,
    resourceType: ResourceType,
    resourceId: string,
  ) {
    const resource = await this.read(accountId, resourceId)

    const subtotal =
      selectResourceFieldValue(resource, fields.subtotalCost)?.number ?? 0

    await this.updateResourceField(
      accountId,
      resourceType,
      resourceId,
      fields.itemizedCosts,
      {
        number: pipe(
          resource.costs,
          map((cost) =>
            cost.isPercentage ? (cost.value * subtotal) / 100 : cost.value,
          ),
          sum(),
        ),
      },
    )
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

    await this.updateResourceField(
      accountId,
      resourceType,
      resourceId,
      fields.subtotalCost,
      { number: Number(subTotal) }, // TODO: this is ignoring that subTotal is bigint
    )
  }

  private async handleResourceUpdate(patch: ResourcePatch) {
    const resource = patch.resource ?? fail('Resource is required')

    if (patch.schema.type === 'Job') {
      if (patch.hasPatch(fields.customer)) {
        await this.updateChildren(patch.schema.accountId, resource.id, {
          childResourceType: 'Part',
          backlinkFieldTemplate: fields.job,
          field: fields.customer,
          valueInput: {
            resourceId: patch.getResourceId(fields.customer),
          },
        })
      }
      if (patch.hasPatch(fields.needDate)) {
        await this.updateChildren(resource.accountId, resource.id, {
          childResourceType: 'Part',
          backlinkFieldTemplate: fields.job,
          field: fields.needDate,
          valueInput: {
            date: patch.getDate(fields.needDate) ?? null,
          },
        })
      }
    }

    if (patch.schema.type === 'Part') {
      const jobId = patch.getResourceId(fields.job)
      if (jobId) {
        if (patch.hasPatch(fields.totalCost)) {
          await this.recalculateSubtotalCost(resource.accountId, 'Job', jobId)
        }

        if (patch.hasPatch(fields.job)) {
          const job = await this.read(resource.accountId, jobId)

          await this.updateResourceField(
            resource.accountId,
            'Part',
            resource.id,
            fields.customer,
            {
              resourceId:
                selectResourceFieldValue(job, fields.customer)?.resource?.id ??
                null,
            },
          )

          await this.updateResourceField(
            resource.accountId,
            'Part',
            resource.id,
            fields.needDate,
            {
              date:
                selectResourceFieldValue(job, fields.needDate)?.date ?? null,
            },
          )
        }
      }
    }

    if (patch.schema.type === 'Purchase') {
      if (patch.hasPatch(fields.vendor)) {
        await this.updateChildren(resource.accountId, resource.id, {
          childResourceType: 'PurchaseLine',
          backlinkFieldTemplate: fields.purchase,
          field: fields.vendor,
          valueInput: {
            resourceId:
              selectResourceFieldValue(resource, fields.vendor)?.resource?.id ??
              null,
          },
        })
      }

      if (patch.hasPatch(fields.job) || patch.hasPatch(fields.purchaseStatus)) {
        const jobId = selectResourceFieldValue(resource, fields.job)?.resource
          ?.id
        if (jobId) {
          await this.recalculateReceivedAllPurchases(resource.accountId, jobId)
        }
      }
    }

    if (patch.schema.type === 'PurchaseLine') {
      const purchaseId = selectResourceFieldValue(resource, fields.purchase)
        ?.resource?.id
      const billId = selectResourceFieldValue(resource, fields.bill)?.resource
        ?.id

      if (purchaseId && patch.hasPatch(fields.totalCost)) {
        await this.recalculateSubtotalCost(
          resource.accountId,
          'Purchase',
          purchaseId,
        )
      }

      if (billId && patch.hasPatch(fields.totalCost)) {
        await this.recalculateSubtotalCost(resource.accountId, 'Bill', billId)
      }

      if (purchaseId && patch.hasPatch(fields.purchase)) {
        const purchase = await this.read(resource.accountId, purchaseId)
        await this.updateResourceField(
          resource.accountId,
          'PurchaseLine',
          resource.id,
          fields.vendor,
          {
            resourceId:
              selectResourceFieldValue(purchase, fields.vendor)?.resource?.id ??
              null,
          },
        )
      }
    }
  }

  async cloneResource(accountId: string, resourceId: string) {
    const source = await this.read(accountId, resourceId)

    const destination = await match(source.type)
      .with('Bill', async () => {
        const schema = await this.schemaService.readSchema(accountId, 'Bill')

        const billStatusField = schema.getField(fields.billStatus)
        const parentRecurrentBillField = schema.getField(
          fields.parentRecurrentBill,
        )
        const parentClonedBillField = schema.getField(fields.parentClonedBill)

        const draftStatusOption =
          billStatusField.options.find(
            (o) => o.templateId === billStatusOptions.draft.templateId,
          ) ?? fail('Draft status not found')

        const destination = await this.create(accountId, source.type, {
          fields: [
            ...source.fields
              .filter(
                (rf) =>
                  ![
                    parentClonedBillField.fieldId,
                    parentRecurrentBillField.fieldId,
                    billStatusField.fieldId,
                  ].includes(rf.fieldId),
              )
              .map(({ fieldId, fieldType, value }) => ({
                fieldId,
                valueInput: mapValueToValueInput(fieldType, value),
              })),
            {
              fieldId: billStatusField.fieldId,
              valueInput: { optionId: draftStatusOption?.id ?? null },
            },
            {
              fieldId: parentClonedBillField.fieldId,
              valueInput: { resourceId: resourceId },
            },
          ],
        })

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
        const schema = await this.schemaService.readSchema(
          accountId,
          'Purchase',
        )

        const orderStatusField = schema.getField(fields.purchaseStatus)

        const draftStatusOption =
          orderStatusField.options.find(
            (o) => o.templateId === purchaseStatusOptions.draft.templateId,
          ) ?? fail('Draft status not found')

        const destination = await this.create(accountId, source.type, {
          fields: [
            ...source.fields
              .filter((rf) => rf.fieldId !== orderStatusField.fieldId)
              .map(({ fieldId, fieldType, value }) => ({
                fieldId,
                valueInput: mapValueToValueInput(fieldType, value),
              })),
            {
              fieldId: orderStatusField.fieldId,
              valueInput: { optionId: draftStatusOption?.id ?? null },
            },
          ],
        })

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
        const schema = await this.schemaService.readSchema(accountId, 'Job')

        const jobStatusField = schema.getField(fields.jobStatus)
        const draftStatusOption = schema.getFieldOption(
          jobStatusField,
          jobStatusOptions.draft,
        )

        const destination = await this.create(accountId, source.type, {
          fields: [
            ...source.fields
              .filter((rf) => rf.fieldId !== jobStatusField.fieldId)
              .map(({ fieldId, fieldType, value }) => ({
                fieldId,
                valueInput: mapValueToValueInput(fieldType, value),
              })),
            {
              fieldId: jobStatusField.fieldId,
              valueInput: { optionId: draftStatusOption?.id ?? null },
            },
          ],
        })

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
          await this.create(accountId, source.type, {
            fields: source.fields.map(({ fieldId, fieldType, value }) => ({
              fieldId,
              valueInput: mapValueToValueInput(fieldType, value),
            })),
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
      await this.create(accountId, lineResourceType, {
        fields: [
          ...line.fields
            .filter(({ fieldId }) => fieldId !== backLinkField.fieldId)
            .map(({ fieldId, fieldType, value }) => ({
              fieldId,
              valueInput: mapValueToValueInput(fieldType, value),
            })),
          {
            fieldId: backLinkField.fieldId,
            valueInput: { resourceId: toResourceId },
          },
        ],
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
        tf: findTemplateField(rf.templateId),
      }))
      .filter(({ sf }) => toSchema.implements(sf))
      .filter(
        ({ tf }) => !tf?.isDerived && tf?.templateId !== fields.name.templateId,
      )

    await this.update(accountId, resourceId, {
      fields: fieldsToUpdate.map(({ rf, sf }) => ({
        fieldId: sf.fieldId,
        valueInput: mapValueToValueInput(sf.type, rf.value),
      })),
    })
  }

  private async recalculateReceivedAllPurchases(
    accountId: string,
    resourceId: string,
  ) {
    const [job, purchases] = await Promise.all([
      this.read(accountId, resourceId),
      this.list(accountId, 'Purchase', {
        where: {
          '==': [{ var: fields.job.name }, resourceId],
        },
      }),
    ])

    await this.updateResourceField(
      accountId,
      'Job',
      job.id,
      fields.receivedAllPurchases,
      {
        boolean: purchases.every((purchase) =>
          [
            purchaseStatusOptions.received.templateId,
            purchaseStatusOptions.canceled.templateId,
          ].includes(
            selectResourceFieldValue(purchase, fields.purchaseStatus)?.option
              ?.templateId as string,
          ),
        ),
      },
    )
  }

  private async updateChildren(
    accountId: string,
    resourceId: string,
    {
      childResourceType,
      backlinkFieldTemplate,
      field,
      valueInput,
    }: {
      childResourceType: ResourceType
      backlinkFieldTemplate: FieldTemplate
      field: FieldTemplate
      valueInput: ValueInput
    },
  ) {
    const children = await this.list(accountId, childResourceType, {
      where: {
        '==': [{ var: backlinkFieldTemplate.name }, resourceId],
      },
    })

    await Promise.all(
      children.map((child) =>
        this.updateResourceField(
          accountId,
          childResourceType,
          child.id,
          field,
          valueInput,
        ),
      ),
    )
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
        const schema = await this.schemaService.readSchema(accountId, 'Bill')

        const billStatusField = schema.getField(fields.billStatus)
        const invoiceDateField = schema.getField(fields.invoiceDate)
        const parentRecurrentBillField = schema.getField(
          fields.parentRecurrentBill,
        )

        const draftStatusOption =
          billStatusField.options.find(
            (o) => o.templateId === billStatusOptions.draft.templateId,
          ) ?? fail('Draft status not found')

        const destination = await this.create(accountId, source.type, {
          fields: [
            ...source.fields
              .filter(
                (rf) =>
                  ![
                    ...recurringFieldsTemplateIds,
                    billStatusField.templateId,
                    invoiceDateField.templateId,
                  ].includes(rf.templateId),
              )
              .map(({ fieldId, fieldType, value }) => ({
                fieldId,
                valueInput: mapValueToValueInput(fieldType, value),
              })),
            {
              fieldId: billStatusField.fieldId,
              valueInput: { optionId: draftStatusOption?.id ?? null },
            },
            {
              fieldId: invoiceDateField.fieldId,
              valueInput: { date: creationDate.toISOString() },
            },
            {
              fieldId: parentRecurrentBillField.fieldId,
              valueInput: { resourceId: recurringResourceId },
            },
          ],
        })

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
