import { isNullish } from 'remeda'
import { container } from 'tsyringe'
import { SchemaField, Schema } from '../schema/entity'
import { selectSchemaFieldUnsafe } from '../schema/extensions'
import { fields } from '../schema/template/system-fields'
import { extractContent } from '../bill/extractData'
import { SchemaService } from '../schema'
import { selectResourceFieldValue } from './extensions'
import { recalculateItemizedCosts, recalculateSubtotalCost } from './costs'
import { Resource, Value, ValueResource } from './entity'
import { linkResource } from './link'
import { readResource, updateResourceField } from '.'

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
  if (resource.type === 'Purchase') {
    await updateResourceField({
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

export const handleResourceUpdate = async ({
  accountId,
  schema,
  resource,
  updatedFields,
}: HandleResourceUpdateParams) => {
  const schemaService = container.resolve(SchemaService)

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
          await linkResource({
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
      await recalculateSubtotalCost(accountId, 'Purchase', purchaseId)
    }

    const billId = selectResourceFieldValue(resource, fields.bill)?.resource?.id
    if (billId) {
      await recalculateSubtotalCost(accountId, 'Bill', billId)
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
    await recalculateItemizedCosts(accountId, resource.id)
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
    const schema = await schemaService.readSchema(
      accountId,
      resource.type,
      true,
    )

    const itemizedCosts =
      selectResourceFieldValue(resource, fields.itemizedCosts)?.number ?? 0
    const subtotalCost =
      selectResourceFieldValue(resource, fields.subtotalCost)?.number ?? 0

    await updateResourceField({
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
    await recalculateSubtotalCost(accountId, 'Bill', resource.id)

    resource = await readResource({ accountId, id: resource.id })
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
      await updateResourceField({
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
