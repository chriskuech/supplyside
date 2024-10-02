import { fail } from 'assert'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { isNullish, map, pipe, sum } from 'remeda'
import { match } from 'ts-pattern'
import { inject, injectable } from 'inversify'
import {
  FieldReference,
  FieldTemplate,
  Schema,
  SchemaField,
  billStatusOptions,
  fields,
  findTemplateField,
  purchaseStatusOptions,
  selectResourceFieldValue,
  selectSchemaField,
  selectSchemaFieldUnsafe,
  Resource,
  Value,
  ResourceType,
  emptyValue,
  ValueInput,
  ResourceTypeSchema,
  ValueResource,
} from '@supplyside/model'
import { SchemaService } from '../schema/SchemaService'
import {
  mapValueInputToPrismaValueCreate,
  mapValueInputToPrismaValueUpdate,
  mapValueInputToPrismaValueWhere,
  mapValueToValueInput,
} from './mappers'
import { createSql } from './json-logic/compile'
import { OrderBy, JsonLogic } from './json-logic/types'
import { mapResourceModelToEntity } from './mappers'
import { resourceInclude } from './model'
import { DuplicateResourceError } from './errors'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'

export type ReadResourceParams = {
  accountId: string;
  type?: ResourceType;
  key?: number;
  id?: string;
} & ({ type: ResourceType; key: number } | { id: string });

export type ResourceFieldInput = {
  fieldId: string;
  valueInput: ValueInput;
};

export type CreateResourceParams = {
  accountId: string;
  type: ResourceType;
  templateId?: string;
  fields?: ResourceFieldInput[];
};

export type FindResourcesParams = {
  accountId: string;
  resourceType: ResourceType;
  input: string;
  exact?: boolean;
};

export type FindByTemplateIdParams = {
  accountId: string;
  templateId: string;
};

export type UpdateTemplateIdParams = {
  accountId: string;
  resourceId: string;
  templateId: string | null;
};

export type ReadResourcesParams = {
  accountId: string;
  type: ResourceType;
  where?: JsonLogic;
  orderBy?: OrderBy[];
};

export type UpdateResourceParams = {
  accountId: string;
  resourceId: string;
  fields: ResourceFieldInput[];
};

export type DeleteResourceParams = {
  accountId: string;
  id: string;
};

type FieldUpdate = {
  field: SchemaField;
  valueInput: Value;
};

type HandleResourceUpdateParams = {
  accountId: string;
  schema: Schema;
  resource: Resource;
  updatedFields: FieldUpdate[];
};

const millisecondsPerDay = 24 * 60 * 60 * 1000

type LinkResourceParams = {
  accountId: string;
  fromResourceId: string;
  toResourceId: string;
  backLinkFieldRef: FieldReference;
};

type LinkLinesParams = {
  accountId: string;
  fromResourceId: string;
  toResourceId: string;
  fromResourceField: FieldTemplate;
  toResourceField: FieldTemplate;
};

type ResourceCopyParams = {
  accountId: string;
  fromResourceId: string;
  toResourceId: string;
};

@injectable()
export class ResourceService {
  constructor(
    @inject(PrismaService) private readonly prisma: PrismaService,
    @inject(SchemaService) private readonly schemaService: SchemaService
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

  async readByTemplateId({ accountId, templateId }: FindByTemplateIdParams) {
    const resource = await this.prisma.resource.findFirst({
      where: { accountId, templateId },
      include: resourceInclude,
    })
    if (!resource) return null

    return mapResourceModelToEntity(resource)
  }

  async findBacklinks(
    accountId: string,
    resourceType: ResourceType,
    linkedToResourceId: string
  ) {
    const models = await this.prisma.resource.findMany({
      where: {
        accountId,
        type: resourceType,
        Value: {
          some: {
            ResourceFieldValue: {
              some: {
                Resource: {
                  id: linkedToResourceId,
                },
              },
            },
          },
        },
      },
      include: resourceInclude,
    })

    return models.map(mapResourceModelToEntity)
  }

  async create({
    accountId,
    type,
    templateId,
    fields: inputResourceFields,
  }: CreateResourceParams): Promise<Resource> {
    const schema = await this.schemaService.readMergedSchema(accountId, type)

    const {
      _max: { key: latestKey },
    } = await this.prisma.resource.aggregate({
      where: { accountId, type },
      _max: { key: true },
    })

    const key = (latestKey ?? 0) + 1

    const poNumberField = selectSchemaField(schema, fields.poNumber)

    const resourceFields: ResourceFieldInput[] = [
      ...(inputResourceFields ?? []),
      ...(poNumberField
        ? [
            {
              fieldId: poNumberField.fieldId,
              valueInput: { string: key.toString() },
            },
          ]
        : []),
    ]

    const model = await this.prisma.resource.create({
      data: {
        accountId,
        templateId,
        type,
        key,
        Cost: {
          create: {
            name: 'Taxes',
            isPercentage: true,
            value: 0,
          },
        },
        ResourceField: {
          create: schema.fields.map((schemaField) => {
            const resourceField = resourceFields?.find(
              (rf) => rf.fieldId === schemaField.fieldId
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
                  schemaField
                ),
              },
            }
          }),
        },
      },
      include: resourceInclude,
    })

    return mapResourceModelToEntity(model)
  }

  async list({
    accountId,
    type,
    where,
    orderBy,
  }: ReadResourcesParams): Promise<Resource[]> {
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

  async update({ accountId, resourceId, fields }: UpdateResourceParams) {
    const resource = await this.read(accountId, resourceId)
    const schema = await this.schemaService.readMergedSchema(
      accountId,
      resource.type
    )

    await Promise.all(
      fields.map(async ({ fieldId, valueInput }) => {
        const sf =
          schema.fields.find((f) => f.fieldId === fieldId) ??
          fail('Field not found in schema')

        const rf = resource.fields.find((rf) => rf.fieldId === fieldId)

        if (resource.templateId && rf?.templateId) {
          throw new Error('Can\'t update a system value on a system resource')
        }

        await this.checkForDuplicateResource(
          sf,
          accountId,
          resource,
          valueInput,
          resourceId
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
      })
    )

    const entity = await this.read(accountId, resourceId)

    await this.handleResourceUpdate({
      accountId,
      schema,
      resource: entity,
      updatedFields: fields.map((field) => ({
        field: selectSchemaField(schema, field) ?? fail('Field not found'),
        valueInput:
          selectResourceFieldValue(entity, field) ?? fail('Value not found'),
      })),
    })

    return await this.read(accountId, resourceId)
  }

  async delete({ accountId, id }: DeleteResourceParams): Promise<void> {
    const model = await this.prisma.resource.delete({
      where: { id, accountId },
      include: resourceInclude,
    })

    const entity = mapResourceModelToEntity(model)
    if (entity.type === 'Line') {
      const purchaseId = selectResourceFieldValue(entity, fields.purchase)
        ?.resource?.id
      if (purchaseId) {
        await this.recalculateSubtotalCost(accountId, 'Purchase', purchaseId)
      }

      const billId = selectResourceFieldValue(entity, fields.bill)?.resource
        ?.id
      if (billId) {
        await this.recalculateSubtotalCost(accountId, 'Bill', billId)
      }
    }
  }

  async updateResourceField({
    accountId,
    resourceId,
    fieldId,
    valueInput,
  }: {
    accountId: string;
    resourceId: string;
    fieldId: string;
    valueInput: ValueInput;
  }) {
    return await this.update({
      accountId,
      resourceId,
      fields: [{ fieldId, valueInput }],
    })
  }

  async updateTemplateId({
    accountId,
    resourceId,
    templateId,
  }: UpdateTemplateIdParams) {
    await this.prisma.resource.update({
      where: { id: resourceId, accountId },
      data: { templateId },
    })
  }

  async checkForDuplicateResource(
    sf: SchemaField,
    accountId: string,
    resource: Resource,
    valueInput: ValueInput,
    resourceId: string
  ) {
    if (sf.templateId === fields.name.templateId) {
      const resourceExists = await this.prisma.resource.findFirst({
        where: {
          accountId,
          type: resource.type,
          ResourceField: {
            some: {
              Field: {
                name: sf.name,
              },
              Value: mapValueInputToPrismaValueWhere(valueInput),
            },
          },
          NOT: {
            id: resourceId,
          },
        },
      })

      if (resourceExists) {
        throw new DuplicateResourceError(
          Object.values(valueInput)[0]?.toString() ?? ''
        )
      }
    }
  }

  async findResourcesByNameOrPoNumber({
    accountId,
    resourceType,
    input,
    exact,
  }: FindResourcesParams): Promise<ValueResource[]> {
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
    LIMIT 15
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
      resource.type
    )

    const subtotal =
      selectResourceFieldValue(resource, fields.subtotalCost)?.number ?? 0

    await this.updateResourceField({
      accountId,
      resourceId,
      fieldId: selectSchemaFieldUnsafe(schema, fields.itemizedCosts).fieldId,
      valueInput: {
        number: pipe(
          resource.costs,
          map((cost) =>
            cost.isPercentage ? (cost.value * subtotal) / 100 : cost.value
          ),
          sum()
        ),
      },
    })
  }

  async recalculateSubtotalCost(
    accountId: string,
    resourceType: ResourceType,
    resourceId: string
  ) {
    const schema = await this.schemaService.readMergedSchema(
      accountId,
      resourceType,
      true
    )

    const lines = await this.list({
      accountId,
      type: 'Line',
      where: {
        '==': [{ var: resourceType }, resourceId],
      },
    })

    const subTotal = pipe(
      lines,
      map(
        (line) => selectResourceFieldValue(line, fields.totalCost)?.number ?? 0
      ),
      sum()
    )

    await this.updateResourceField({
      accountId,
      fieldId: selectSchemaFieldUnsafe(schema, fields.subtotalCost)?.fieldId,
      resourceId,
      valueInput: {
        number: Number(subTotal), // TODO: this is ignoring that subTotal is bigint
      },
    })
  }

  async handleResourceUpdate({
    accountId,
    schema,
    resource,
    updatedFields,
  }: HandleResourceUpdateParams) {
    // When a Resource Field is updated,
    // Then copy the linked Resource's Fields
    const updatedFieldsWithResourceType = updatedFields.filter(
      (
        uf: FieldUpdate
      ): uf is FieldUpdate & { valueInput: { resource: ValueResource } } =>
        !!uf.field.resourceType && !!uf.valueInput.resource
    )
    if (updatedFieldsWithResourceType.length) {
      await Promise.all(
        updatedFieldsWithResourceType.map(
          async ({ field: { fieldId }, valueInput }) => {
            await this.linkResource({
              accountId,
              fromResourceId: valueInput.resource.id,
              toResourceId: resource.id,
              backLinkFieldRef: { fieldId },
            })
          }
        )
      )
    }

    // When the Line."Unit Cost" or Line."Quantity" or a new item is selected field is updated,
    // Then update Line."Total Cost"
    if (
      resource.type === 'Line' &&
      updatedFields.some(
        (rf) =>
          rf.field.templateId === fields.unitCost.templateId ||
          rf.field.templateId === fields.quantity.templateId ||
          rf.valueInput.resource?.type === 'Item'
      )
    ) {
      const totalCostFieldId = selectSchemaFieldUnsafe(
        schema,
        fields.totalCost
      ).fieldId
      const unitCost =
        selectResourceFieldValue(resource, fields.unitCost)?.number ?? 0
      const quantity =
        selectResourceFieldValue(resource, fields.quantity)?.number ?? 0

      await this.updateResourceField({
        accountId,
        fieldId: totalCostFieldId,
        resourceId: resource.id,
        valueInput: {
          number: unitCost * quantity,
        },
      })
    }

    // When the Line."Total Cost" field is updated,
    // Then update the {Bill|Purchase}."Subtotal Cost" field
    if (
      resource.type === 'Line' &&
      updatedFields.some(
        (rf) => rf.field.templateId === fields.totalCost.templateId
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

    // When the {Bill|Purchase}."Subtotal Cost" field is updated,
    // Then recalculate the {Bill|Purchase}."Itemized Costs" field
    if (
      ['Bill', 'Purchase'].includes(resource.type) &&
      updatedFields.some(
        (rf) => rf.field.templateId === fields.subtotalCost.templateId
      )
    ) {
      await this.recalculateItemizedCosts(accountId, resource.id)
    }

    // When the {Bill|Purchase}."Itemized Costs" or {Bill|Purchase}."Subtotal Cost" field is updated,
    // Then update {Bill|Purchase}."Total Cost"
    if (
      ['Bill', 'Purchase'].includes(resource.type) &&
      updatedFields.some(
        (rf) =>
          rf.field.templateId === fields.subtotalCost.templateId ||
          rf.field.templateId === fields.itemizedCosts.templateId
      )
    ) {
      const schema = await this.schemaService.readMergedSchema(
        accountId,
        resource.type,
        true
      )

      const itemizedCosts =
        selectResourceFieldValue(resource, fields.itemizedCosts)?.number ?? 0
      const subtotalCost =
        selectResourceFieldValue(resource, fields.subtotalCost)?.number ?? 0

      await this.updateResourceField({
        accountId,
        fieldId: selectSchemaFieldUnsafe(schema, fields.totalCost).fieldId,
        resourceId: resource.id,
        valueInput: {
          number: itemizedCosts + subtotalCost,
        },
      })
    }

    // When the Purchase field of a Bill resource has been updated (an Purchase has been linked to a Bill)
    // Then recalculate the Bill."Subtotal Cost"
    if (
      resource.type === 'Bill' &&
      updatedFields.some(
        (rf) => rf.field.templateId === fields.purchase.templateId
      )
    ) {
      await this.recalculateSubtotalCost(accountId, 'Bill', resource.id)

      resource = await this.read(accountId, resource.id)
    }

    // When the Bill.“Invoice Date” field or Bill.“Payment Terms” field changes,
    // Given the “Invoice Date” field and “Payment Terms” fields are not null,
    // Then set “Payment Due Date” = “Invoice Date” + “Payment Terms”
    if (
      resource.type === 'Bill' &&
      updatedFields.some(
        (rf) =>
          rf.field.templateId === fields.invoiceDate.templateId ||
          rf.field.templateId === fields.paymentTerms.templateId
      )
    ) {
      const invoiceDate = selectResourceFieldValue(
        resource,
        fields.invoiceDate
      )?.date
      const paymentTerms = selectResourceFieldValue(
        resource,
        fields.paymentTerms
      )?.number

      if (!isNullish(invoiceDate) && !isNullish(paymentTerms)) {
        await this.updateResourceField({
          accountId,
          fieldId: selectSchemaFieldUnsafe(schema, fields.paymentDueDate)
            .fieldId,
          resourceId: resource.id,
          valueInput: {
            date: new Date(
              new Date(invoiceDate).getTime() +
                paymentTerms * millisecondsPerDay
            ).toISOString(),
          },
        })
      }
    }

    // // When the "Bill Files" field is updated,
    // // Then extract their PO # and Vendor ID
    // if (
    //   resource.type === "Bill" &&
    //   updatedFields.some(
    //     (rf) => rf.field.templateId === fields.billFiles.templateId
    //   )
    // ) {
    //   await this.billExtractionService.extractContent(accountId, resource.id);
    // }
  }

  async linkResource({
    accountId,
    fromResourceId,
    toResourceId,
  }: LinkResourceParams & { backLinkFieldRef: FieldReference }) {
    const [fromResource, toResource] = await Promise.all([
      this.read(accountId, fromResourceId),
      this.read(accountId, toResourceId),
    ])

    await this.copyFields({
      accountId,
      fromResourceId,
      toResourceId,
    })

    if (fromResource.type === 'Purchase' && toResource.type === 'Bill') {
      await this.cloneCosts({
        accountId,
        fromResourceId,
        toResourceId,
      })
      await this.linkLines({
        accountId,
        fromResourceId,
        toResourceId,
        fromResourceField: fields.purchase,
        toResourceField: fields.bill,
      })
    }
  }

  private async linkLines({
    accountId,
    fromResourceId,
    toResourceId,
    fromResourceField,
    toResourceField,
  }: LinkLinesParams) {
    const lineSchema = await this.schemaService.readMergedSchema(
      accountId,
      'Line'
    )

    const lines = await this.list({
      accountId,
      type: 'Line',
      where: {
        '==': [{ var: fromResourceField.name }, fromResourceId],
      },
    })

    await Promise.all(
      lines.map((line) =>
        this.updateResourceField({
          accountId,
          resourceId: line.id,
          fieldId: selectSchemaFieldUnsafe(lineSchema, toResourceField).fieldId,
          valueInput: { resourceId: toResourceId },
        })
      )
    )
  }

  async cloneResource(accountId: string, resourceId: string) {
    const source = await this.read(accountId, resourceId)

    const destination = await match(source.type)
      .with('Bill', async () => {
        const schema = await this.schemaService.readMergedSchema(
          accountId,
          'Bill'
        )

        const billStatusField = selectSchemaFieldUnsafe(
          schema,
          fields.billStatus
        )

        const draftStatusOption =
          billStatusField.options.find(
            (o) => o.templateId === billStatusOptions.draft.templateId
          ) ?? fail('Draft status not found')

        const destination = await this.create({
          accountId,
          type: source.type,
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
          'Purchase'
        )

        const orderStatusField = selectSchemaFieldUnsafe(
          schema,
          fields.purchaseStatus
        )

        const draftStatusOption =
          orderStatusField.options.find(
            (o) => o.templateId === purchaseStatusOptions.draft.templateId
          ) ?? fail('Draft status not found')

        const destination = await this.create({
          accountId,
          type: source.type,
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
      .otherwise(
        async () =>
          await this.create({
            accountId,
            type: source.type,
            fields: source.fields.map(({ fieldId, fieldType, value }) => ({
              fieldId,
              valueInput: mapValueToValueInput(fieldType, value),
            })),
          })
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

  async cloneLines({
    accountId,
    fromResourceId,
    toResourceId,
    backLinkFieldRef,
  }: ResourceCopyParams & { backLinkFieldRef: FieldReference }) {
    const lineSchema = await this.schemaService.readMergedSchema(
      accountId,
      'Line'
    )

    const backLinkField = selectSchemaFieldUnsafe(lineSchema, backLinkFieldRef)

    const lines = await this.list({
      accountId,
      type: 'Line',
      where: {
        '==': [{ var: backLinkField.name }, fromResourceId],
      },
    })

    // `createResource` is not (currently) parallelizable
    for (const line of lines) {
      await this.create({
        accountId,
        type: 'Line',
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

  async copyFields({
    accountId,
    fromResourceId,
    toResourceId,
  }: ResourceCopyParams) {
    const [fromResource, toResource] = await Promise.all([
      this.read(accountId, fromResourceId),
      this.read(accountId, toResourceId),
    ])

    const [fromSchema, toSchema] = await Promise.all([
      this.schemaService.readMergedSchema(accountId, fromResource.type),
      this.schemaService.readMergedSchema(accountId, toResource.type),
    ])

    const fieldsToUpdate = fromResource.fields
      .map((rf) => ({
        rf,
        sf: selectSchemaFieldUnsafe(fromSchema, rf),
        tf: findTemplateField(rf.templateId),
      }))
      .filter(({ sf }) => selectSchemaField(toSchema, sf))
      .filter(({ tf }) => !tf?.isDerived)

    const resource = await this.update({
      accountId,
      resourceId: toResourceId,
      fields: fieldsToUpdate.map(({ rf, sf }) => ({
        fieldId: sf.fieldId,
        valueInput: mapValueToValueInput(sf.type, rf.value),
      })),
    })

    await this.handleResourceUpdate({
      accountId,
      schema: toSchema,
      resource,
      updatedFields: fieldsToUpdate.map(({ sf, rf }) => ({
        field: sf,
        valueInput: rf.value,
      })),
    })
  }

  async findResourceByUniqueValue(
    accountId: string,
    resourceType: ResourceType,
    fieldTemplate: FieldReference,
    valueInput: ValueInput
  ) {
    const resourceSchema = await this.schemaService.readMergedSchema(
      accountId,
      resourceType
    )
    const fieldId = selectSchemaFieldUnsafe(
      resourceSchema,
      fieldTemplate
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
}
