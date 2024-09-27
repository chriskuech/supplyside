import { fail } from 'assert'
import { Prisma, ResourceType } from '@prisma/client'
import { z } from 'zod'
import { isNullish, map, pipe, sum } from 'remeda'
import { match } from 'ts-pattern'
import { inject, injectable } from 'inversify'
import {
  selectSchemaField,
  selectSchemaFieldUnsafe,
} from '../schema/extensions'
import {
  billStatusOptions,
  fields,
  findTemplateField,
  purchaseStatusOptions,
} from '../schema/template/system-fields'
import { Schema, SchemaField } from '../schema/entity'
import { SchemaService } from '../schema/SchemaService'
import { extractContent } from '../bill/extractData'
import { FieldTemplate } from '../schema/template/types'
import { FieldRef, selectResourceFieldValue } from './extensions'
import {
  mapValueInputToPrismaValueCreate,
  mapValueInputToPrismaValueUpdate,
  mapValueInputToPrismaValueWhere,
  mapValueToValueInput,
} from './mappers'
import { Resource, Value, ValueResource, emptyValue } from './entity'
import { ValueInput } from './patch'
import { createSql } from './json-logic/compile'
import { OrderBy, Where } from './json-logic/types'
import { mapResourceModelToEntity } from './mappers'
import { resourceInclude } from './model'
import { DuplicateResourceError } from './errors'
import { PrismaService } from '@/integrations/PrismaService'

export type ReadResourceParams = {
  accountId: string
  type?: ResourceType
  key?: number
  id?: string
} & ({ type: ResourceType; key: number } | { id: string })

export type ResourceFieldInput = {
  fieldId: string
  value: ValueInput
}

export type CreateResourceParams = {
  accountId: string
  type: ResourceType
  templateId?: string
  fields?: ResourceFieldInput[]
}

export type FindResourcesParams = {
  accountId: string
  resourceType: ResourceType
  input: string
  exact?: boolean
}

export type FindByTemplateIdParams = {
  accountId: string
  templateId: string
}

export type UpdateTemplateIdParams = {
  accountId: string
  resourceId: string
  templateId: string | null
}

export type UpdateResourceFieldParams = {
  accountId: string
  resourceId: string
  fieldId: string
  value: ValueInput
}

export type ReadResourcesParams = {
  accountId: string
  type: ResourceType
  where?: Where
  orderBy?: OrderBy[]
}

export type UpdateResourceParams = {
  accountId: string
  resourceId: string
  fields: ResourceFieldInput[]
}

export type DeleteResourceParams = {
  accountId: string
  id: string
}

type FieldUpdate = {
  field: SchemaField
  value: Value
}

type HandleResourceUpdateParams = {
  accountId: string
  schema: Schema
  resource: Resource
  updatedFields: FieldUpdate[]
}

const millisecondsPerDay = 24 * 60 * 60 * 1000

type HandleResourceCreateParams = {
  accountId: string
  schema: Schema
  resource: Resource
}

type LinkResourceParams = {
  accountId: string
  fromResourceId: string
  toResourceId: string
  backLinkFieldRef: FieldRef
}

type LinkLinesParams = {
  accountId: string
  fromResourceId: string
  toResourceId: string
  fromResourceField: FieldTemplate
  toResourceField: FieldTemplate
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

  async read(accountId: string, resourceType: ResourceType, id: string) {
    const model = await this.prisma.resource.findUniqueOrThrow({
      where: {
        id,
        accountId,
        type: resourceType,
      },
      include: resourceInclude,
    })

    return mapResourceModelToEntity(model)
  }

  async findBacklinks(
    accountId: string,
    resourceType: ResourceType,
    linkedToResourceId: string,
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

  async createResource({
    accountId,
    type,
    templateId,
    fields: resourceFields,
  }: CreateResourceParams): Promise<Resource> {
    const schema = await this.schemaService.readSchema(accountId, type)

    const {
      _max: { key },
    } = await this.prisma.resource.aggregate({
      where: { accountId, type },
      _max: { key: true },
    })

    const resource = await this.prisma.resource.create({
      data: {
        accountId,
        templateId,
        type,
        key: (key ?? 0) + 1,
        Cost: {
          create: {
            name: 'Taxes',
            isPercentage: true,
            value: 0,
          },
        },
        ResourceField: {
          create: schema.allFields.map((schemaField) => {
            const resourceField = resourceFields?.find(
              (rf) => rf.fieldId === schemaField.id,
            )

            return {
              Field: {
                connect: {
                  id: schemaField.id,
                },
              },
              Value: {
                create: mapValueInputToPrismaValueCreate(
                  resourceField?.value ??
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

    await this.handleResourceCreate({
      accountId,
      schema,
      resource: mapResourceModelToEntity(resource),
    })

    return await this.readResource({ accountId, id: resource.id })
  }

  async readResource({
    accountId,
    type,
    key,
    id,
  }: ReadResourceParams): Promise<Resource> {
    const model = await this.prisma.resource.findUniqueOrThrow({
      where: {
        id,
        accountId_type_key:
          type && key
            ? {
                accountId,
                type,
                key,
              }
            : undefined,
      },
      include: resourceInclude,
    })

    return mapResourceModelToEntity(model)
  }

  async readResources({
    accountId,
    type,
    where,
    orderBy,
  }: ReadResourcesParams): Promise<Resource[]> {
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

  async updateResource({
    accountId,
    resourceId,
    fields,
  }: UpdateResourceParams) {
    const resource = await this.readResource({ accountId, id: resourceId })
    const schema = await this.schemaService.readSchema(accountId, resource.type)

    await Promise.all(
      fields.map(async ({ fieldId, value }) => {
        const sf =
          schema.allFields.find((f) => f.id === fieldId) ??
          fail('Field not found in schema')

        const rf = resource.fields.find(
          (resourceField) => resourceField.fieldId === fieldId,
        )

        if (resource.templateId && rf?.templateId) {
          throw new Error("Can't update a system value on a system resource")
        }

        await this.checkForDuplicateResource(
          sf,
          accountId,
          resource,
          value,
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
              create: mapValueInputToPrismaValueCreate(value, sf),
            },
          },
          update: {
            Value: {
              upsert: {
                create: mapValueInputToPrismaValueCreate(value, sf),
                update: mapValueInputToPrismaValueUpdate(value),
              },
            },
          },
        })
      }),
    )

    const entity = await this.readResource({ accountId, id: resourceId })

    await this.handleResourceUpdate({
      accountId,
      schema,
      resource: entity,
      updatedFields: fields.map((field) => ({
        field: selectSchemaField(schema, field) ?? fail('Field not found'),
        value:
          selectResourceFieldValue(entity, field) ?? fail('Value not found'),
      })),
    })

    return await this.readResource({ accountId, id: resourceId })
  }

  async deleteResource({ accountId, id }: DeleteResourceParams): Promise<void> {
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

      const billId = selectResourceFieldValue(entity, fields.bill)?.resource?.id
      if (billId) {
        await this.recalculateSubtotalCost(accountId, 'Bill', billId)
      }
    }
  }

  async updateResourceField({
    accountId,
    resourceId,
    fieldId,
    value,
  }: UpdateResourceFieldParams) {
    return await this.updateResource({
      accountId,
      resourceId,
      fields: [{ fieldId, value }],
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

  async findByTemplateId({ accountId, templateId }: FindByTemplateIdParams) {
    const resource = await this.prisma.resource.findFirst({
      where: { accountId, templateId },
      include: resourceInclude,
    })
    if (!resource) return null

    return mapResourceModelToEntity(resource)
  }

  async checkForDuplicateResource(
    sf: SchemaField,
    accountId: string,
    resource: Resource,
    value: ValueInput,
    resourceId: string,
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
              Value: mapValueInputToPrismaValueWhere(value),
            },
          },
          NOT: {
            id: resourceId,
          },
        },
      })

      if (resourceExists) {
        throw new DuplicateResourceError(Object.values(value)[0])
      }
    }
  }

  async findResources({
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
        AND "Field"."templateId" IN (${fields.name.templateId}::uuid, ${fields.poNumber.templateId}::uuid)
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
        type: z.nativeEnum(ResourceType),
        name: z.string(),
        key: z.number(),
        templateId: z.string().nullable(),
      })
      .array()
      .parse(results)
  }

  async recalculateItemizedCosts(accountId: string, resourceId: string) {
    const resource = await this.readResource({
      accountId,
      id: resourceId,
    })
    const schema = await this.schemaService.readSchema(accountId, resource.type)

    const subtotal =
      selectResourceFieldValue(resource, fields.subtotalCost)?.number ?? 0

    await this.updateResourceField({
      accountId,
      resourceId,
      fieldId: selectSchemaFieldUnsafe(schema, fields.itemizedCosts).id,
      value: {
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
    const schema = await this.schemaService.readSchema(
      accountId,
      resourceType,
      true,
    )

    const lines = await this.readResources({
      accountId,
      type: 'Line',
      where: {
        '==': [{ var: resourceType }, resourceId],
      },
    })

    const subTotal = pipe(
      lines,
      map(
        (line) => selectResourceFieldValue(line, fields.totalCost)?.number ?? 0,
      ),
      sum(),
    )

    await this.updateResourceField({
      accountId,
      fieldId: selectSchemaFieldUnsafe(schema, fields.subtotalCost)?.id,
      resourceId,
      value: {
        number: Number(subTotal), // TODO: this is ignoring that subTotal is bigint
      },
    })
  }

  async handleResourceCreate({
    accountId,
    schema,
    resource,
  }: HandleResourceCreateParams) {
    if (resource.type === 'Purchase') {
      await this.updateResourceField({
        accountId,
        resourceId: resource.id,
        fieldId: selectSchemaFieldUnsafe(schema, fields.poNumber).id,
        value: { string: resource.key.toString() },
      })
    }

    // When the "Bill Files" field is updated,
    // Then extract their PO # and Vendor ID
    if (resource.type === 'Bill') {
      await extractContent(accountId, resource.id)
    }
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
        uf: FieldUpdate,
      ): uf is FieldUpdate & { value: { resource: ValueResource } } =>
        !!uf.field.resourceType && !!uf.value.resource,
    )
    if (updatedFieldsWithResourceType.length) {
      await Promise.all(
        updatedFieldsWithResourceType.map(
          async ({ field: { id: fieldId }, value }) => {
            await this.linkResource({
              accountId,
              fromResourceId: value.resource.id,
              toResourceId: resource.id,
              backLinkFieldRef: { fieldId },
            })
          },
        ),
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
          rf.value.resource?.type === 'Item',
      )
    ) {
      const totalCostFieldId = selectSchemaFieldUnsafe(
        schema,
        fields.totalCost,
      ).id
      const unitCost =
        selectResourceFieldValue(resource, fields.unitCost)?.number ?? 0
      const quantity =
        selectResourceFieldValue(resource, fields.quantity)?.number ?? 0

      await this.updateResourceField({
        accountId,
        fieldId: totalCostFieldId,
        resourceId: resource.id,
        value: {
          number: unitCost * quantity,
        },
      })
    }

    // When the Line."Total Cost" field is updated,
    // Then update the {Bill|Purchase}."Subtotal Cost" field
    if (
      resource.type === 'Line' &&
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

    // When the {Bill|Purchase}."Subtotal Cost" field is updated,
    // Then recalculate the {Bill|Purchase}."Itemized Costs" field
    if (
      ['Bill', 'Purchase'].includes(resource.type) &&
      updatedFields.some(
        (rf) => rf.field.templateId === fields.subtotalCost.templateId,
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
          rf.field.templateId === fields.itemizedCosts.templateId,
      )
    ) {
      const schema = await this.schemaService.readSchema(
        accountId,
        resource.type,
        true,
      )

      const itemizedCosts =
        selectResourceFieldValue(resource, fields.itemizedCosts)?.number ?? 0
      const subtotalCost =
        selectResourceFieldValue(resource, fields.subtotalCost)?.number ?? 0

      await this.updateResourceField({
        accountId,
        fieldId: selectSchemaFieldUnsafe(schema, fields.totalCost).id,
        resourceId: resource.id,
        value: {
          number: itemizedCosts + subtotalCost,
        },
      })
    }

    // When the Purchase field of a Bill resource has been updated (an Purchase has been linked to a Bill)
    // Then recalculate the Bill."Subtotal Cost"
    if (
      resource.type === 'Bill' &&
      updatedFields.some(
        (rf) => rf.field.templateId === fields.purchase.templateId,
      )
    ) {
      await this.recalculateSubtotalCost(accountId, 'Bill', resource.id)

      resource = await this.readResource({ accountId, id: resource.id })
    }

    // When the Bill.“Invoice Date” field or Bill.“Payment Terms” field changes,
    // Given the “Invoice Date” field and “Payment Terms” fields are not null,
    // Then set “Payment Due Date” = “Invoice Date” + “Payment Terms”
    if (
      resource.type === 'Bill' &&
      updatedFields.some(
        (rf) =>
          rf.field.templateId === fields.invoiceDate.templateId ||
          rf.field.templateId === fields.paymentTerms.templateId,
      )
    ) {
      const invoiceDate = selectResourceFieldValue(
        resource,
        fields.invoiceDate,
      )?.date
      const paymentTerms = selectResourceFieldValue(
        resource,
        fields.paymentTerms,
      )?.number

      if (!isNullish(invoiceDate) && !isNullish(paymentTerms)) {
        await this.updateResourceField({
          accountId,
          fieldId: selectSchemaFieldUnsafe(schema, fields.paymentDueDate).id,
          resourceId: resource.id,
          value: {
            date: new Date(
              invoiceDate.getTime() + paymentTerms * millisecondsPerDay,
            ),
          },
        })
      }
    }

    // When the "Bill Files" field is updated,
    // Then extract their PO # and Vendor ID
    if (
      resource.type === 'Bill' &&
      updatedFields.some(
        (rf) => rf.field.templateId === fields.billFiles.templateId,
      )
    ) {
      await extractContent(accountId, resource.id)
    }
  }

  async linkResource({
    accountId,
    fromResourceId,
    toResourceId,
  }: LinkResourceParams & { backLinkFieldRef: FieldRef }) {
    const [fromResource, toResource] = await Promise.all([
      this.readResource({
        accountId,
        id: fromResourceId,
      }),
      this.readResource({
        accountId,
        id: toResourceId,
      }),
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
    const lineSchema = await this.schemaService.readSchema(
      accountId,
      ResourceType.Line,
    )

    const lines = await this.readResources({
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
          fieldId: selectSchemaFieldUnsafe(lineSchema, toResourceField).id,
          value: { resourceId: toResourceId },
        }),
      ),
    )
  }

  async cloneResource(accountId: string, resourceId: string) {
    const source = await this.readResource({
      accountId,
      id: resourceId,
    })

    const destination = await match(source.type)
      .with('Bill', async () => {
        const schema = await this.schemaService.readSchema(accountId, 'Bill')

        const billStatusField = selectSchemaFieldUnsafe(
          schema,
          fields.billStatus,
        )

        const draftStatusOption =
          billStatusField.options.find(
            (o) => o.templateId === billStatusOptions.draft.templateId,
          ) ?? fail('Draft status not found')

        const destination = await this.createResource({
          accountId,
          type: source.type,
          fields: [
            ...source.fields
              .filter((rf) => rf.fieldId !== billStatusField.id)
              .map(({ fieldId, fieldType, value }) => ({
                fieldId,
                value: mapValueToValueInput(fieldType, value),
              })),
            {
              fieldId: billStatusField.id,
              value: { optionId: draftStatusOption?.id ?? null },
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
        const schema = await this.schemaService.readSchema(
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

        const destination = await this.createResource({
          accountId,
          type: source.type,
          fields: [
            ...source.fields
              .filter((rf) => rf.fieldId !== orderStatusField.id)
              .map(({ fieldId, fieldType, value }) => ({
                fieldId,
                value: mapValueToValueInput(fieldType, value),
              })),
            {
              fieldId: orderStatusField.id,
              value: { optionId: draftStatusOption?.id ?? null },
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
          await this.createResource({
            accountId,
            type: source.type,
            fields: source.fields.map(({ fieldId, fieldType, value }) => ({
              fieldId,
              value: mapValueToValueInput(fieldType, value),
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

  async cloneLines({
    accountId,
    fromResourceId,
    toResourceId,
    backLinkFieldRef,
  }: ResourceCopyParams & { backLinkFieldRef: FieldRef }) {
    const lineSchema = await this.schemaService.readSchema(accountId, 'Line')

    const backLinkField = selectSchemaFieldUnsafe(lineSchema, backLinkFieldRef)

    const lines = await this.readResources({
      accountId,
      type: 'Line',
      where: {
        '==': [{ var: backLinkField.name }, fromResourceId],
      },
    })

    // `createResource` is not (currently) parallelizable
    for (const line of lines) {
      await this.createResource({
        accountId,
        type: 'Line',
        fields: [
          ...line.fields
            .filter(({ fieldId }) => fieldId !== backLinkField.id)
            .map(({ fieldId, fieldType, value }) => ({
              fieldId,
              value: mapValueToValueInput(fieldType, value),
            })),
          {
            fieldId: backLinkField.id,
            value: { resourceId: toResourceId },
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
      this.readResource({
        accountId,
        id: fromResourceId,
      }),
      this.readResource({
        accountId,
        id: toResourceId,
      }),
    ])

    const [fromSchema, toSchema] = await Promise.all([
      this.schemaService.readSchema(accountId, fromResource.type),
      this.schemaService.readSchema(accountId, toResource.type),
    ])

    const fieldsToUpdate = fromResource.fields
      .map((rf) => ({
        rf,
        sf: selectSchemaFieldUnsafe(fromSchema, rf),
        tf: findTemplateField(rf.templateId),
      }))
      .filter(({ sf }) => selectSchemaField(toSchema, sf))
      .filter(({ tf }) => !tf?.isDerived)

    const resource = await this.updateResource({
      accountId,
      resourceId: toResourceId,
      fields: fieldsToUpdate.map(({ rf, sf }) => ({
        fieldId: sf.id,
        value: mapValueToValueInput(sf.type, rf.value),
      })),
    })

    await this.handleResourceUpdate({
      accountId,
      schema: toSchema,
      resource,
      updatedFields: fieldsToUpdate.map(({ sf, rf }) => ({
        field: sf,
        value: rf.value,
      })),
    })
  }

  async findResourceByUniqueValue(
    accountId: string,
    resourceType: ResourceType,
    fieldTemplate: FieldTemplate,
    valueInput: ValueInput,
  ) {
    const resourceSchema = await this.schemaService.readSchema(
      accountId,
      resourceType,
    )
    const fieldId = selectSchemaFieldUnsafe(resourceSchema, fieldTemplate).id

    const value = mapValueInputToPrismaValueWhere(valueInput)

    const resourceField = await this.prisma.resourceField.findFirst({
      where: {
        fieldId,
        Value: value,
        Resource: { accountId },
      },
    })

    if (!resourceField) return null

    return this.readResource({ accountId, id: resourceField.resourceId })
  }
}
