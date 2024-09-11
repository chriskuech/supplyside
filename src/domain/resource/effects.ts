import { fail } from 'assert'
import { SchemaField, Schema, selectSchemaField } from '../schema/types'
import { readSchema } from '../schema/actions'
import { fields } from '../schema/template/system-fields'
import { selectResourceField } from './extensions'
import { recalculateItemizedCosts, recalculateSubtotalCost } from './costs'
import { Resource, Value } from './entity'
import { copyLinkedResourceFields } from './fields'
import { updateResourceField } from '.'

const millisecondsPerDay = 24 * 60 * 60 * 1000

type HandleResourceCreateParams = {
  accountId: string
  schema: Schema
  resource: Resource
}

export const handleResourceCreate = async ({
  accountId,
  schema,
  resource,
}: HandleResourceCreateParams) => {
  await Promise.all(
    resource.fields
      .filter(
        ({ fieldId, value }) =>
          selectSchemaField(schema, { fieldId })?.resourceType &&
          value.resource?.id,
      )
      .map(({ fieldId, value }) =>
        copyLinkedResourceFields(
          resource.id,
          fieldId,
          value.resource?.id ?? fail(),
        ),
      ),
  )

  if (resource.type === 'Order') {
    await updateResourceField({
      accountId,
      resourceId: resource.id,
      fieldId:
        selectSchemaField(schema, fields.number)?.id ??
        fail(`"${fields.number.name}" field not found`),
      value: { string: resource.key.toString() },
    })
  }
}

type HandleResourceUpdateParams = {
  accountId: string
  schema: Schema
  resource: Resource
  updatedFields: { field: SchemaField; value: Value }[]
}

export const handleResourceUpdate = async ({
  accountId,
  schema,
  resource,
  updatedFields,
}: HandleResourceUpdateParams) => {
  // When the Line."Unit Cost" or Line."Quantity" field is updated,
  // Then update Line."Total Cost"
  if (
    resource.type === 'Line' &&
    updatedFields.some(
      (rf) =>
        rf.field.templateId === fields.unitCost.templateId ||
        rf.field.templateId === fields.quantity.templateId,
    )
  ) {
    const totalCostFieldId =
      selectSchemaField(schema, fields.totalCost)?.id ?? fail()
    const unitCost = selectResourceField(resource, fields.unitCost)?.number ?? 0
    const quantity = selectResourceField(resource, fields.quantity)?.number ?? 0

    await updateResourceField({
      accountId,
      fieldId: totalCostFieldId,
      resourceId: resource.id,
      value: {
        number: unitCost * quantity,
      },
    })
  }

  // When the Line."Total Cost" field is updated,
  // Then update the {Bill|Order}."Subtotal Cost" field
  if (
    resource.type === 'Line' &&
    updatedFields.some(
      (rf) => rf.field.templateId === fields.totalCost.templateId,
    )
  ) {
    const orderId = selectResourceField(resource, fields.order)?.resource?.id
    if (orderId) {
      await recalculateSubtotalCost(accountId, 'Order', orderId)
    }

    const billId = selectResourceField(resource, fields.bill)?.resource?.id
    if (billId) {
      await recalculateSubtotalCost(accountId, 'Bill', billId)
    }
  }

  // When the {Bill|Order}."Subtotal Cost" field is updated,
  // Then recalculate the {Bill|Order}."Itemized Costs" field
  if (
    ['Bill', 'Order'].includes(resource.type) &&
    updatedFields.some(
      (rf) => rf.field.templateId === fields.subtotalCost.templateId,
    )
  ) {
    await recalculateItemizedCosts(accountId, resource.id)
  }

  // When the {Bill|Order}."Itemized Costs" or {Bill|Order}."Subtotal Cost" field is updated,
  // Then update {Bill|Order}."Total Cost"
  if (
    ['Bill', 'Order'].includes(resource.type) &&
    updatedFields.some(
      (rf) =>
        rf.field.templateId === fields.subtotalCost.templateId ||
        rf.field.templateId === fields.itemizedCosts.templateId,
    )
  ) {
    const schema = await readSchema({
      accountId,
      resourceType: resource.type,
      isSystem: true,
    })

    const itemizedCosts =
      selectResourceField(resource, fields.itemizedCosts)?.number ?? 0
    const subtotalCost =
      selectResourceField(resource, fields.subtotalCost)?.number ?? 0

    await updateResourceField({
      accountId,
      fieldId: selectSchemaField(schema, fields.totalCost)?.id ?? fail(),
      resourceId: resource.id,
      value: {
        number: itemizedCosts + subtotalCost,
      },
    })
  }

  // When the Order field of a Bill resource has been updated (an Order has been linked to a Bill)
  // Then recalculate the Bill."Subtotal Cost"
  if (
    resource.type === 'Bill' &&
    updatedFields.some((rf) => rf.field.templateId === fields.order.templateId)
  ) {
    await recalculateSubtotalCost(accountId, 'Bill', resource.id)
  }

  // When the “Invoice Date” field or “Payment Terms” field changes,
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
    const invoiceDate = selectResourceField(resource, fields.invoiceDate)?.date
    const paymentTerms = selectResourceField(
      resource,
      fields.paymentTerms,
    )?.number

    if (invoiceDate && paymentTerms) {
      await updateResourceField({
        accountId,
        fieldId: selectSchemaField(schema, fields.paymentDueDate)?.id ?? fail(),
        resourceId: resource.id,
        value: {
          date: new Date(
            invoiceDate.getTime() + paymentTerms * millisecondsPerDay,
          ),
        },
      })
    }
  }
}
