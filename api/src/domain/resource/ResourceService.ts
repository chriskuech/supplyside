import { Prisma } from '@prisma/client'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { ConflictError } from '@supplyside/api/integrations/fastify/ConflictError'
import {
  Cost,
  FieldReference,
  Resource,
  ResourceType,
  ResourceTypeSchema,
  Schema,
  SchemaField,
  Value,
  ValueInput,
  ValueResource,
  billStatusOptions,
  emptyValue,
  fields,
  findTemplateField,
  jobStatusOptions,
  purchaseStatusOptions,
  selectResourceFieldValue,
  selectSchemaField,
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { fail } from 'assert'
import { inject, injectable } from 'inversify'
import { map, pipe, sum } from 'remeda'
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
  mapValueInputToPrismaValueWhere,
  mapValueToValueInput,
} from './mappers'
import { resourceInclude } from './model'

export type ResourceFieldInput = {
  fieldId: string
  valueInput: ValueInput
}

type FieldUpdate = {
  field: SchemaField
  valueInput: Value
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
    {
      templateId,
      fields: inputResourceFields = [],
    }: {
      templateId?: string
      fields?: ResourceFieldInput[]
    },
    userId?: string,
  ): Promise<Resource> {
    const schema = await this.schemaService.readMergedSchema(accountId, type)

    await Promise.all(
      inputResourceFields.map((field) => {
        if (!field?.valueInput.string) return
        const schemaField = selectSchemaFieldUnsafe(schema, field)

        return this.assertNoDuplicateNamedResource(
          schemaField,
          accountId,
          type,
          field.valueInput,
          null,
        )
      }),
    )

    const {
      _max: { key: latestKey },
    } = await this.prisma.resource.aggregate({
      where: { accountId, type },
      _max: { key: true },
    })

    const key = (latestKey ?? 0) + 1

    const defaultFields = match<ResourceType, ResourceFieldInput[]>(type)
      .with('Purchase', () => {
        const poNumberFieldId = selectSchemaFieldUnsafe(
          schema,
          fields.poNumber,
        ).fieldId

        const assigneeFieldId = selectSchemaFieldUnsafe(
          schema,
          fields.assignee,
        ).fieldId

        return [
          {
            fieldId: poNumberFieldId,
            valueInput: { string: key.toString() },
          },
          ...(userId
            ? [
                {
                  fieldId: assigneeFieldId,
                  valueInput: { userId },
                },
              ]
            : []),
        ]
      })
      .with('Bill', () => {
        const asigneeFieldId = selectSchemaFieldUnsafe(
          schema,
          fields.assignee,
        ).fieldId

        if (!userId) return []

        return [
          {
            fieldId: asigneeFieldId,
            valueInput: { userId },
          },
        ]
      })
      .otherwise(() => [])

    const resourceFields: ResourceFieldInput[] = [
      ...(inputResourceFields ?? []),
      ...defaultFields,
    ]

    const model = await this.prisma.resource.create({
      data: {
        accountId,
        templateId,
        type,
        key,
        ResourceField: {
          create: schema.fields.map((schemaField) => {
            const resourceField = resourceFields?.find(
              (rf) => rf.fieldId === schemaField.fieldId,
            )

            return {
              Field: {
                connect: {
                  id: schemaField.fieldId,
                },
              },
              Value: {
                create: mapValueInputToPrismaValueCreate(
                  resourceField?.valueInput ??
                    mapValueToValueInput(schemaField.type, emptyValue),
                  schemaField,
                ),
              },
            }
          }),
        },
      },
      include: resourceInclude,
    })

    const entity = mapResourceModelToEntity(model)

    await this.handleResourceUpdate({
      accountId,
      resource: entity,
      schema,
      updatedFields: resourceFields.map((field) => ({
        field: selectSchemaFieldUnsafe(schema, field),
        valueInput:
          selectResourceFieldValue(entity, field) ?? fail('Value not found'),
      })),
    })

    return entity
  }

  async list(
    accountId: string,
    type: ResourceType,
    {
      where,
      orderBy,
    }: {
      where?: JsonLogic
      orderBy?: OrderBy[]
    } = {},
  ): Promise<Resource[]> {
    const schema = await this.schemaService.readMergedSchema(accountId, type)
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

  async update(
    accountId: string,
    resourceId: string,
    input: { fields?: ResourceFieldInput[]; costs?: Cost[] },
  ) {
    const resource = await this.read(accountId, resourceId)
    const schema = await this.schemaService.readMergedSchema(
      accountId,
      resource.type,
    )

    const { fields, costs } = deriveFields(input, { schema, resource })

    await Promise.all(
      fields.map(async ({ fieldId, valueInput }) => {
        const sf =
          schema.fields.find((f) => f.fieldId === fieldId) ??
          fail('Field not found in schema')

        const rf = resource.fields.find((rf) => rf.fieldId === fieldId)

        if (resource.templateId && rf?.templateId) {
          throw new Error("Can't update a system value on a system resource")
        }

        await this.assertNoDuplicateNamedResource(
          sf,
          accountId,
          resource.type,
          valueInput,
          resourceId,
        )

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
              create: mapValueInputToPrismaValueCreate(valueInput, sf),
            },
          },
          update: {
            Value: {
              upsert: {
                create: mapValueInputToPrismaValueCreate(valueInput, sf),
                update: mapValueInputToPrismaValueUpdate(valueInput),
              },
            },
          },
        })
      }),
    )

    await Promise.all(
      costs?.map((cost) =>
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

    await this.handleResourceUpdate({
      accountId,
      schema,
      resource: entity,
      updatedFields: fields.map((field) => ({
        field: selectSchemaFieldUnsafe(schema, field),
        valueInput:
          selectResourceFieldValue(entity, field) ?? fail('Value not found'),
      })),
    })

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
    resourceId: string,
    data: {
      fieldId: string
      valueInput: ValueInput
    },
  ) {
    return await this.update(accountId, resourceId, {
      fields: [data],
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

  private async assertNoDuplicateNamedResource(
    sf: SchemaField,
    accountId: string,
    type: ResourceType,
    valueInput: ValueInput,
    resourceId: string | null,
  ) {
    if (sf.templateId === fields.name.templateId) {
      const resourceExists = await this.prisma.resource.findFirst({
        where: {
          accountId,
          type,
          ResourceField: {
            some: {
              Field: {
                name: sf.name,
              },
              Value: mapValueInputToPrismaValueWhere(valueInput),
            },
          },
          ...(resourceId
            ? {
                NOT: {
                  id: resourceId,
                },
              }
            : {}),
        },
      })

      if (resourceExists) {
        throw new ConflictError(
          `A Resource already exists with ${sf.name} = ${Object.values(valueInput)[0]?.toString()}`,
        )
      }
    }
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
    const resource = await this.read(accountId, resourceId)
    const schema = await this.schemaService.readMergedSchema(
      accountId,
      resource.type,
    )

    const subtotal =
      selectResourceFieldValue(resource, fields.subtotalCost)?.number ?? 0

    await this.updateResourceField(accountId, resourceId, {
      fieldId: selectSchemaFieldUnsafe(schema, fields.itemizedCosts).fieldId,
      valueInput: {
        number: pipe(
          resource.costs,
          map((cost) =>
            cost.isPercentage ? (cost.value * subtotal) / 100 : cost.value,
          ),
          sum(),
        ),
      },
    })
  }

  async recalculateSubtotalCost(
    accountId: string,
    resourceType: ResourceType,
    resourceId: string,
  ) {
    const schema = await this.schemaService.readMergedSchema(
      accountId,
      resourceType,
      true,
    )

    const lines = await this.list(
      accountId,
      resourceType === 'Job' ? 'JobLine' : 'PurchaseLine',
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

    await this.updateResourceField(accountId, resourceId, {
      fieldId: selectSchemaFieldUnsafe(schema, fields.subtotalCost)?.fieldId,
      valueInput: {
        number: Number(subTotal), // TODO: this is ignoring that subTotal is bigint
      },
    })
  }

  private async handleResourceUpdate({
    accountId,
    resource,
    updatedFields,
  }: {
    accountId: string
    schema: Schema
    resource: Resource
    updatedFields: FieldUpdate[]
  }) {
    if (
      resource.type === 'Job' &&
      updatedFields.some(
        (rf) => rf.field.templateId === fields.customer.templateId,
      )
    ) {
      const jobLines = await this.list(accountId, 'JobLine', {
        where: {
          '==': [{ var: fields.job.name }, resource.id],
        },
      })

      await this.updateJobLinesCustomerName(
        accountId,
        resource,
        jobLines.map((line) => line.id),
      )
    }

    if (
      resource.type === 'Purchase' &&
      updatedFields.some(
        (rf) => rf.field.templateId === fields.vendor.templateId,
      )
    ) {
      const purchaseLines = await this.list(accountId, 'PurchaseLine', {
        where: {
          '==': [{ var: fields.purchase.name }, resource.id],
        },
      })

      await this.updatePurchaseLinesVendorName(
        accountId,
        resource,
        purchaseLines.map((line) => line.id),
      )
    }

    if (
      resource.type === 'PurchaseLine' &&
      updatedFields.some(
        (rf) => rf.field.templateId === fields.totalCost.templateId,
      )
    ) {
      const purchaseId = selectResourceFieldValue(resource, fields.purchase)
        ?.resource?.id

      if (purchaseId) {
        await this.recalculateSubtotalCost(accountId, 'Purchase', purchaseId)
      }

      const billId = selectResourceFieldValue(resource, fields.bill)?.resource
        ?.id
      if (billId) {
        await this.recalculateSubtotalCost(accountId, 'Bill', billId)
      }
    }

    if (
      resource.type === 'PurchaseLine' &&
      updatedFields.some(
        (rf) => rf.field.templateId === fields.purchase.templateId,
      )
    ) {
      const purchaseId = selectResourceFieldValue(resource, fields.purchase)
        ?.resource?.id

      if (purchaseId) {
        const purchase = await this.read(accountId, purchaseId)
        await this.updatePurchaseLinesVendorName(accountId, purchase, [
          resource.id,
        ])
      }
    }

    if (
      resource.type === 'JobLine' &&
      updatedFields.some(
        (rf) => rf.field.templateId === fields.totalCost.templateId,
      )
    ) {
      const jobId = selectResourceFieldValue(resource, fields.job)?.resource?.id

      if (jobId) {
        await this.recalculateSubtotalCost(accountId, 'Job', jobId)
      }
    }

    if (
      resource.type === 'JobLine' &&
      updatedFields.some((rf) => rf.field.templateId === fields.job.templateId)
    ) {
      const jobId = selectResourceFieldValue(resource, fields.job)?.resource?.id

      if (jobId) {
        const job = await this.read(accountId, jobId)
        await this.updateJobLinesCustomerName(accountId, job, [resource.id])
      }
    }

    if (
      resource.type === 'Purchase' &&
      updatedFields.some((rf) =>
        [fields.job.templateId, fields.purchaseStatus.templateId].includes(
          rf.field.templateId as string,
        ),
      )
    ) {
      const jobId = selectResourceFieldValue(resource, fields.job)?.resource?.id
      if (jobId) {
        await this.recalculateReceivedAllPurchases(accountId, jobId)
      }
    }
  }

  async cloneResource(accountId: string, resourceId: string) {
    const source = await this.read(accountId, resourceId)

    const destination = await match(source.type)
      .with('Bill', async () => {
        const schema = await this.schemaService.readMergedSchema(
          accountId,
          'Bill',
        )

        const billStatusField = selectSchemaFieldUnsafe(
          schema,
          fields.billStatus,
        )

        const draftStatusOption =
          billStatusField.options.find(
            (o) => o.templateId === billStatusOptions.draft.templateId,
          ) ?? fail('Draft status not found')

        const destination = await this.create(accountId, source.type, {
          fields: [
            ...source.fields
              .filter((rf) => rf.fieldId !== billStatusField.fieldId)
              .map(({ fieldId, fieldType, value }) => ({
                fieldId,
                valueInput: mapValueToValueInput(fieldType, value),
              })),
            {
              fieldId: billStatusField.fieldId,
              valueInput: { optionId: draftStatusOption?.id ?? null },
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
        const schema = await this.schemaService.readMergedSchema(
          accountId,
          'Purchase',
        )

        const orderStatusField = selectSchemaFieldUnsafe(
          schema,
          fields.purchaseStatus,
        )

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
        const schema = await this.schemaService.readMergedSchema(
          accountId,
          'Job',
        )

        const jobStatusField = selectSchemaFieldUnsafe(schema, fields.jobStatus)

        const draftStatusOption = selectSchemaFieldOptionUnsafe(
          schema,
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
    backLinkFieldRef: FieldReference
    resourceType: ResourceType
  }) {
    const lineResourceType = resourceType === 'Job' ? 'JobLine' : 'PurchaseLine'
    const lineSchema = await this.schemaService.readMergedSchema(
      accountId,
      lineResourceType,
    )

    const backLinkField = selectSchemaFieldUnsafe(lineSchema, backLinkFieldRef)

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
      this.schemaService.readMergedSchema(accountId, fromResource.type),
      this.schemaService.readMergedSchema(accountId, toResource.type),
    ])

    const fieldsToUpdate = fromResource.fields
      .filter((rf) => selectSchemaField(fromSchema, rf))
      .map((rf) => ({
        rf,
        sf: selectSchemaFieldUnsafe(fromSchema, rf),
        tf: findTemplateField(rf.templateId),
      }))
      .filter(({ sf }) => selectSchemaField(toSchema, sf))
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

  async findResourceByUniqueValue(
    accountId: string,
    resourceType: ResourceType,
    fieldTemplate: FieldReference,
    valueInput: ValueInput,
  ) {
    const resourceSchema = await this.schemaService.readMergedSchema(
      accountId,
      resourceType,
    )
    const fieldId = selectSchemaFieldUnsafe(
      resourceSchema,
      fieldTemplate,
    ).fieldId

    const value = mapValueInputToPrismaValueWhere(valueInput)

    const resourceField = await this.prisma.resourceField.findFirst({
      where: {
        fieldId,
        Value: value,
        Resource: { accountId },
      },
    })

    if (!resourceField) return null

    return this.read(accountId, resourceField.resourceId)
  }

  private async recalculateReceivedAllPurchases(
    accountId: string,
    resourceId: string,
  ) {
    const [job, jobSchema, purchases] = await Promise.all([
      this.read(accountId, resourceId),
      this.schemaService.readMergedSchema(accountId, 'Job'),
      this.list(accountId, 'Purchase', {
        where: {
          '==': [{ var: fields.job.name }, resourceId],
        },
      }),
    ])

    await this.updateResourceField(accountId, job.id, {
      fieldId: selectSchemaFieldUnsafe(jobSchema, fields.receivedAllPurchases)
        .fieldId,
      valueInput: {
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
    })
  }

  private async updateJobLinesCustomerName(
    accountId: string,
    job: Resource,
    jobLineIds: string[],
  ) {
    const jobLineSchema = await this.schemaService.readMergedSchema(
      accountId,
      'JobLine',
    )
    const customerFieldId = selectSchemaFieldUnsafe(
      jobLineSchema,
      fields.customer,
    ).fieldId

    const jobSchema = await this.schemaService.readMergedSchema(
      accountId,
      'Job',
    )
    const jobCustomerFieldId = selectSchemaFieldUnsafe(
      jobSchema,
      fields.customer,
    ).fieldId

    const customerResourceId = selectResourceFieldValue(job, {
      fieldId: jobCustomerFieldId,
    })?.resource?.id

    return Promise.all(
      jobLineIds.map(async (jobLineId) => {
        await this.update(accountId, jobLineId, {
          fields: [
            {
              fieldId: customerFieldId,
              valueInput: { resourceId: customerResourceId ?? null },
            },
          ],
        })
      }),
    )
  }

  private async updatePurchaseLinesVendorName(
    accountId: string,
    purchase: Resource,
    purchaseLineIds: string[],
  ) {
    const purchaseLineSchema = await this.schemaService.readMergedSchema(
      accountId,
      'PurchaseLine',
    )
    const vendorFieldId = selectSchemaFieldUnsafe(
      purchaseLineSchema,
      fields.vendor,
    ).fieldId

    const purchaseSchema = await this.schemaService.readMergedSchema(
      accountId,
      'Purchase',
    )

    const jobVendorFieldId = selectSchemaFieldUnsafe(
      purchaseSchema,
      fields.vendor,
    ).fieldId

    const vendorResourceId = selectResourceFieldValue(purchase, {
      fieldId: jobVendorFieldId,
    })?.resource?.id

    await Promise.all(
      purchaseLineIds.map((purchaseLineId) => {
        return this.update(accountId, purchaseLineId, {
          fields: [
            {
              fieldId: vendorFieldId,
              valueInput: { resourceId: vendorResourceId ?? null },
            },
          ],
        })
      }),
    )
  }
}
