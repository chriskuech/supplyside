import { isNullish, isTruthy } from 'remeda'
import { Cost } from '@prisma/client'
import { extractContent } from '../bill/extractData'
import { fields } from '../schema/template/system-fields'
import { FieldTemplate } from '../schema/template/types'
import { Schema, SchemaField } from '../schema/entity'
import { selectSchemaFieldUnsafe } from '../schema/extensions'
import { Resource, Value } from './entity'
import { selectResourceFieldValue } from './extensions'
import { copyFields } from './copy'

type ResourcePatch = {
  schemaField: SchemaField
  value: Partial<Value>
}

const selectPatch = (patches: ResourcePatch[], template: FieldTemplate) =>
  patches.find((p) => p.schemaField.templateId === template.templateId)

export const patchResource = async (
  schema: Schema,
  resource: Resource,
  patches: ResourcePatch[],
): Promise<Resource> => {
  const [, updatedResource] = await reduce(
    [schema, resource, patches],
    [
      applyPatches,
      extractBillContent,
      applyLinkedResourceFields,
      recalculateBillPaymentDueDate,
      recalculateLineTotalCost,
      recalculateBillOrderItemizedCosts,
      recalculateBillOrderTotalCost,
      validateUniqueName,
    ],
  )

  return updatedResource
}

type State = [Schema, Resource, ResourcePatch[]]

type AsyncReducer = (state: State) => Promise<State>
type Reducer = (state: State) => State

const reduce = async (
  state: State,
  [reducer, ...reducers]: (Reducer | AsyncReducer)[],
): Promise<State> =>
  !reducer
    ? state
    : Promise.resolve(reducer(state)).then((state) => reduce(state, reducers))

const applyPatches: Reducer = ([schema, resource, patches]) => [
  schema,
  patches.reduce(
    (resource, patch) => ({
      ...resource,
      fields: resource.fields.map((field) =>
        field.templateId === patch.schemaField.templateId
          ? {
              ...field,
              value: {
                ...field.value,
                ...patch.value,
              },
            }
          : field,
      ),
    }),
    resource,
  ),
  patches,
]

const applyPatch = (
  [schema, resource, patches]: State,
  patch: ResourcePatch,
): State => [
  schema,
  {
    ...resource,
    fields: resource.fields.map((field) =>
      field.templateId === patch.schemaField.templateId
        ? {
            ...field,
            value: {
              ...field.value,
              ...patch.value,
            },
          }
        : field,
    ),
  },
  [...patches, patch],
]

const recalculateBillPaymentDueDate: Reducer = ([
  schema,
  resource,
  patches,
]) => {
  if (resource.type === 'Bill') {
    const invoiceDatePatch = selectPatch(patches, fields.invoiceDate)
    const paymentTermsPatch = selectPatch(patches, fields.paymentTerms)
    if (invoiceDatePatch || paymentTermsPatch) {
      const invoiceDate = selectResourceFieldValue(
        resource,
        fields.invoiceDate,
      )?.date
      const paymentTerms = selectResourceFieldValue(
        resource,
        fields.paymentTerms,
      )?.number

      if (!isNullish(invoiceDate) && !isNullish(paymentTerms)) {
        const millisecondsPerDay = 24 * 60 * 60 * 1000

        const patch = {
          schemaField: selectSchemaFieldUnsafe(schema, fields.paymentDueDate),
          value: {
            date: new Date(
              invoiceDate.getTime() + paymentTerms * millisecondsPerDay,
            ),
          },
        }

        return applyPatch([schema, resource, patches], patch)
      }
    }
  }

  return [schema, resource, patches]
}

const recalculateLineTotalCost: AsyncReducer = async ([
  schema,
  resource,
  patches,
]) => {
  if (resource.type === 'Line') {
    const unitCostPatch = selectPatch(patches, fields.unitCost)
    const quantityPatch = selectPatch(patches, fields.quantity)
    if (unitCostPatch || quantityPatch) {
      const unitCost =
        selectResourceFieldValue(resource, fields.unitCost)?.number ?? 0
      const quantity =
        selectResourceFieldValue(resource, fields.quantity)?.number ?? 0

      return applyPatch([schema, resource, patches], {
        schemaField: selectSchemaFieldUnsafe(schema, fields.totalCost),
        value: {
          number: unitCost * quantity,
        },
      })
    }
  }

  return [schema, resource, patches]
}

const recalculateBillOrderTotalCost: AsyncReducer = async ([
  schema,
  resource,
  patches,
]) => {
  if (resource.type === 'Bill' || resource.type === 'Order') {
    const itemizedCostsPatch = selectPatch(patches, fields.itemizedCosts)
    const subtotalCostPatch = selectPatch(patches, fields.subtotalCost)
    if (itemizedCostsPatch || subtotalCostPatch) {
      const itemizedCosts =
        selectResourceFieldValue(resource, fields.itemizedCosts)?.number ?? 0
      const subtotalCost =
        selectResourceFieldValue(resource, fields.subtotalCost)?.number ?? 0

      return applyPatch([schema, resource, patches], {
        schemaField: selectSchemaFieldUnsafe(schema, fields.totalCost),
        value: {
          number: itemizedCosts + subtotalCost,
        },
      })
    }
  }

  return [schema, resource, patches]
}

const recalculateBillOrderItemizedCosts: Reducer = ([
  schema,
  resource,
  patches,
]) => {
  if (resource.type === 'Bill' || resource.type === 'Order') {
    const subtotalCostPatch = selectPatch(patches, fields.subtotalCost)
    if (subtotalCostPatch) {
      const subtotalCost =
        selectResourceFieldValue(resource, fields.subtotalCost)?.number ?? 0
      const costs = resource.costs.map(
        (cost): Cost => ({
          ...cost,
          value: cost.isPercentage ? cost.value * subtotalCost : cost.value,
        }),
      )

      return applyPatch([schema, { ...resource, costs }, patches], {
        schemaField: selectSchemaFieldUnsafe(schema, fields.itemizedCosts),
        value: {
          number: costs.reduce((sum, cost) => sum + cost.value, 0),
        },
      })
    }
  }

  return [schema, resource, patches]
}

const extractBillContent: AsyncReducer = async ([
  schema,
  resource,
  patches,
]) => {
  if (resource.type === 'Bill') {
    if (selectPatch(patches, fields.billFiles)) {
      // TODO: this needs to return `State`
      await extractContent(resource.accountId, resource.id)
    }
  }

  return [schema, resource, patches]
}

const applyLinkedResourceFields: AsyncReducer = async ([
  schema,
  resource,
  patches,
]) => {
  const linkedResourceIds = patches
    .map((patch) => patch.value.resource?.id)
    .filter(isTruthy)

  await Promise.all(
    linkedResourceIds.map((linkedResourceId) =>
      copyFields({
        accountId: resource.accountId,
        fromResourceId: linkedResourceId,
        toResourceId: resource.id,
      }),
    ),
  )

  return [schema, resource, patches]
}

const validateUniqueName: Reducer = ([schema, resource, patches]) => {
  const namePatch = selectPatch(patches, fields.name)
  if (namePatch) {
    const name = namePatch.value.string

    if (!name) {
      throw new Error(`Resource name cannot be empty`)
    }

    const existingResource = await prisma().resource.findFirst({
      where: {
        accountId: resource.accountId,
        type: resource.type,
        name,
      },
    })

    if (existingResource) {
      throw new Error(`Resource name "${name}" is already taken`)
    }
  }

  return [schema, resource, patches]
}
