import { ResourcePatch, fields, jobStatusOptions } from '@supplyside/model'
import { isNumber } from 'remeda'

const millisecondsPerDay = 24 * 60 * 60 * 1000

const setInvoiceDate = (patch: ResourcePatch) => {
  if (
    !patch.schema.implements(fields.jobStatus, fields.invoiceDate) ||
    !patch.hasPatch(fields.jobStatus) ||
    patch.hasPatch(fields.invoiceDate)
  )
    return

  patch.setDate(fields.invoiceDate, new Date().toISOString())
}

const recalculatePaymentDueDateFromNeedDate = (patch: ResourcePatch) => {
  if (
    !patch.schema.implements(
      fields.needDate,
      fields.paymentTerms,
      fields.paymentDueDate,
    ) ||
    !patch.hasAnyPatch(fields.needDate, fields.paymentTerms)
  )
    return

  const needDate = patch.getDate(fields.needDate)
  const paymentTerms = patch.getNumber(fields.paymentTerms)

  if (!needDate || !isNumber(paymentTerms)) return

  patch.setDate(
    fields.paymentDueDate,
    new Date(
      new Date(needDate).getTime() + paymentTerms * millisecondsPerDay,
    ).toISOString(),
  )
}

const recalculatePaymentDueDateFromInvoiceDate = (patch: ResourcePatch) => {
  if (
    !patch.schema.implements(
      fields.invoiceDate,
      fields.paymentTerms,
      fields.paymentDueDate,
    ) ||
    !patch.hasAnyPatch(fields.invoiceDate, fields.paymentTerms)
  )
    return

  const invoiceDate = patch.getDate(fields.invoiceDate)
  const paymentTerms = patch.getNumber(fields.paymentTerms)

  if (!invoiceDate || !isNumber(paymentTerms)) return

  patch.setDate(
    fields.paymentDueDate,
    new Date(
      new Date(invoiceDate).getTime() + paymentTerms * millisecondsPerDay,
    ).toISOString(),
  )
}

const recalculateDocumentTotalCost = (patch: ResourcePatch) => {
  if (
    !patch.schema.implements(
      fields.subtotalCost,
      fields.itemizedCosts,
      fields.totalCost,
    )
  )
    return

  const subtotalCost = patch.getNumber(fields.subtotalCost) ?? 0
  const itemizedCosts = patch.getNumber(fields.itemizedCosts) ?? 0

  patch.setNumber(fields.totalCost, subtotalCost + itemizedCosts)
}

const recalculateLineTotalCost = (patch: ResourcePatch) => {
  if (
    !patch.schema.implements(fields.unitCost, fields.quantity, fields.totalCost)
  )
    return

  const unitCost = patch.getNumber(fields.unitCost) ?? 0
  const quantity = patch.getNumber(fields.quantity) ?? 0

  patch.setNumber(fields.totalCost, unitCost * quantity)
}

const recalculateItemizedCosts = (patch: ResourcePatch) => {
  if (
    !patch.schema.implements(fields.subtotalCost, fields.itemizedCosts) ||
    !patch.hasAnyPatch(fields.subtotalCost) ||
    !patch.patchedCosts.length
  )
    return

  const subtotalCost = patch.getNumber(fields.subtotalCost) ?? 0
  const itemizedCosts = patch.costs.reduce(
    (acc, { isPercentage, value }) =>
      acc + (isPercentage ? (value / 100) * subtotalCost : value),
    0,
  )

  patch.setNumber(fields.itemizedCosts, itemizedCosts)
}

const setStartDate = (patch: ResourcePatch) => {
  if (
    !patch.schema.implements(fields.jobStatus, fields.startDate) ||
    !patch.hasPatch(fields.jobStatus) ||
    !patch.hasOption(fields.jobStatus, jobStatusOptions.inProcess)
  )
    return

  patch.setDate(fields.startDate, new Date().toISOString())
}

const recalculateProductionDays = (patch: ResourcePatch) => {
  if (
    !patch.schema.implements(fields.hours, fields.productionDays) ||
    !patch.hasPatch(fields.hours) ||
    patch.hasPatch(fields.productionDays)
  )
    return

  const hours = patch.getNumber(fields.hours) ?? 0

  patch.setNumber(fields.productionDays, Math.ceil(hours / 8))
}

export const deriveFields = (patch: ResourcePatch) => {
  setInvoiceDate(patch)
  setStartDate(patch)
  recalculatePaymentDueDateFromNeedDate(patch)
  recalculatePaymentDueDateFromInvoiceDate(patch)
  recalculateLineTotalCost(patch)
  recalculateItemizedCosts(patch)
  recalculateDocumentTotalCost(patch)
  recalculateProductionDays(patch)
}
