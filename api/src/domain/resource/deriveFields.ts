import {
  Cost,
  Resource,
  Schema,
  fields,
  selectResourceFieldValue,
  selectSchemaField,
} from '@supplyside/model'
import { pipe } from 'remeda'
import { ResourceFieldInput } from './ResourceService'

const millisecondsPerDay = 24 * 60 * 60 * 1000

type Context = {
  schema: Schema
  resource: Resource | undefined
}

type Patch = {
  fields: ResourceFieldInput[]
  costs: Cost[]
}

const recalculatePaymentDueDateFromNeedDate =
  (context: Context) =>
  (patch: Patch): Patch => {
    const needDateField = selectSchemaField(context.schema, fields.needDate)
    const paymentTermsField = selectSchemaField(
      context.schema,
      fields.paymentTerms,
    )
    const paymentDueDateField = selectSchemaField(
      context.schema,
      fields.paymentDueDate,
    )

    if (!needDateField || !paymentTermsField || !paymentDueDateField)
      return patch

    if (
      !patch.fields.some((f) => f.fieldId === needDateField.fieldId) &&
      !patch.fields.some((f) => f.fieldId === paymentTermsField.fieldId)
    )
      return patch

    const needDate =
      patch.fields.find((f) => f.fieldId === needDateField.fieldId)?.valueInput
        .date ??
      (context.resource &&
        selectResourceFieldValue(context.resource, needDateField)?.date)
    const paymentTerms =
      patch.fields.find((f) => f.fieldId === paymentTermsField.fieldId)
        ?.valueInput.number ??
      (context.resource &&
        selectResourceFieldValue(context.resource, paymentTermsField)?.number)

    if (!needDate || typeof paymentTerms !== 'number') return patch

    return {
      ...patch,
      fields: [
        ...patch.fields.filter(
          (f) => f.fieldId !== paymentDueDateField.fieldId,
        ),
        {
          fieldId: paymentDueDateField.fieldId,
          valueInput: {
            date: new Date(
              new Date(needDate).getTime() + paymentTerms * millisecondsPerDay,
            ).toISOString(),
          },
        },
      ],
    }
  }

const recalculatePaymentDueDateFromInvoiceDate =
  (context: Context) =>
  (patch: Patch): Patch => {
    const invoiceDateField = selectSchemaField(
      context.schema,
      fields.invoiceDate,
    )
    const paymentTermsField = selectSchemaField(
      context.schema,
      fields.paymentTerms,
    )
    const paymentDueDateField = selectSchemaField(
      context.schema,
      fields.paymentDueDate,
    )

    if (!invoiceDateField || !paymentTermsField || !paymentDueDateField)
      return patch

    if (
      !patch.fields.some((f) => f.fieldId === invoiceDateField.fieldId) &&
      !patch.fields.some((f) => f.fieldId === paymentTermsField.fieldId)
    )
      return patch

    const invoiceDate =
      patch.fields.find((f) => f.fieldId === invoiceDateField.fieldId)
        ?.valueInput.date ??
      (context.resource &&
        selectResourceFieldValue(context.resource, invoiceDateField)?.date)
    const paymentTerms =
      patch.fields.find((f) => f.fieldId === paymentTermsField.fieldId)
        ?.valueInput.number ??
      (context.resource &&
        selectResourceFieldValue(context.resource, paymentTermsField)?.number)

    if (!invoiceDate || typeof paymentTerms !== 'number') return patch

    return {
      ...patch,
      fields: [
        ...patch.fields.filter(
          (f) => f.fieldId !== paymentDueDateField.fieldId,
        ),
        {
          fieldId: paymentDueDateField.fieldId,
          valueInput: {
            date: new Date(
              new Date(invoiceDate).getTime() +
                paymentTerms * millisecondsPerDay,
            ).toISOString(),
          },
        },
      ],
    }
  }

const recalculateDocumentTotalCost =
  (context: Context) =>
  (patch: Patch): Patch => {
    const subtotalField = selectSchemaField(context.schema, fields.subtotalCost)
    const itemizedCostsField = selectSchemaField(
      context.schema,
      fields.itemizedCosts,
    )
    const totalCostField = selectSchemaField(context.schema, fields.totalCost)

    if (!subtotalField || !itemizedCostsField || !totalCostField) return patch

    const subtotalCost =
      patch.fields.find((f) => f.fieldId === subtotalField.fieldId)?.valueInput
        .number ??
      (context.resource &&
        selectResourceFieldValue(context.resource, subtotalField)?.number) ??
      0
    const itemizedCosts =
      patch.fields.find((f) => f.fieldId === itemizedCostsField.fieldId)
        ?.valueInput.number ??
      (context.resource &&
        selectResourceFieldValue(context.resource, itemizedCostsField)
          ?.number) ??
      0

    return {
      ...patch,
      fields: [
        ...patch.fields.filter((f) => f.fieldId !== totalCostField.fieldId),
        {
          fieldId: totalCostField.fieldId,
          valueInput: {
            number: subtotalCost + itemizedCosts,
          },
        },
      ],
    }
  }

const recalculateLineTotalCost =
  (context: Context) =>
  (patch: Patch): Patch => {
    const unitCostField = selectSchemaField(context.schema, fields.unitCost)
    const quantityField = selectSchemaField(context.schema, fields.quantity)
    const totalCostField = selectSchemaField(context.schema, fields.totalCost)

    if (!unitCostField || !quantityField || !totalCostField) return patch

    const unitCost =
      patch.fields.find((f) => f.fieldId === unitCostField.fieldId)?.valueInput
        .number ??
      (context.resource &&
        selectResourceFieldValue(context.resource, unitCostField)?.number) ??
      0
    const quantity =
      patch.fields.find((f) => f.fieldId === quantityField.fieldId)?.valueInput
        .number ??
      (context.resource &&
        selectResourceFieldValue(context.resource, quantityField)?.number) ??
      0

    return {
      ...patch,
      fields: [
        ...patch.fields.filter((f) => f.fieldId !== totalCostField.fieldId),
        {
          fieldId: totalCostField.fieldId,
          valueInput: {
            number: unitCost * quantity,
          },
        },
      ],
    }
  }

const recalculateItemizedCosts =
  (context: Context) =>
  (patch: Patch): Patch => {
    const subtotalCostField = selectSchemaField(
      context.schema,
      fields.subtotalCost,
    )
    const itemizedCostsField = selectSchemaField(
      context.schema,
      fields.itemizedCosts,
    )

    if (!subtotalCostField || !itemizedCostsField) return patch

    if (
      !patch.fields.some((f) => f.fieldId === subtotalCostField.fieldId) &&
      !patch.costs.length
    )
      return patch

    const subtotalCost =
      patch.fields.find((f) => f.fieldId === subtotalCostField.fieldId)
        ?.valueInput.number ??
      (context.resource &&
        selectResourceFieldValue(context.resource, subtotalCostField)
          ?.number) ??
      0
    const itemizedCosts =
      patch.fields.find((f) => f.fieldId === itemizedCostsField.fieldId)
        ?.valueInput.number ??
      (context.resource &&
        selectResourceFieldValue(context.resource, itemizedCostsField)
          ?.number) ??
      0

    return {
      ...patch,
      fields: [
        ...patch.fields.filter((f) => f.fieldId !== itemizedCostsField.fieldId),
        {
          fieldId: itemizedCostsField.fieldId,
          valueInput: {
            number: subtotalCost + itemizedCosts,
          },
        },
      ],
    }
  }

export const deriveFields = (
  { fields = [], costs = [] }: Partial<Patch>,
  context: Context,
): Patch => {
  return pipe(
    { fields, costs },
    recalculatePaymentDueDateFromInvoiceDate(context),
    recalculatePaymentDueDateFromNeedDate(context),
    recalculateLineTotalCost(context),
    recalculateItemizedCosts(context),
    recalculateDocumentTotalCost(context),
  )
}
