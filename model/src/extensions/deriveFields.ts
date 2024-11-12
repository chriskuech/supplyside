import { TypedResource, fields, jobStatusOptions } from '..'

const millisecondsPerDay = 24 * 60 * 60 * 1000

const recalculatePaymentDueDateFromNeedDate = (resource: TypedResource) => {
  if (
    !resource.implements(
      fields.needDate,
      fields.paymentTerms,
      fields.paymentDueDate,
    )
  )
    return

  if (
    !resource.hasPatch(fields.needDate) &&
    !resource.hasPatch(fields.paymentTerms)
  )
    return

  const needDate = resource.get(fields.needDate)?.date
  const paymentTerms = resource.get(fields.paymentTerms)?.number

  if (!needDate || typeof paymentTerms !== 'number') return

  resource.set(fields.paymentDueDate, {
    date: new Date(
      new Date(needDate).getTime() + paymentTerms * millisecondsPerDay,
    ).toISOString(),
  })
}

const recalculatePaymentDueDateFromInvoiceDate = (resource: TypedResource) => {
  if (
    !resource.implements(
      fields.invoiceDate,
      fields.paymentTerms,
      fields.paymentDueDate,
    )
  )
    return

  if (
    !resource.hasPatch(fields.invoiceDate) &&
    !resource.hasPatch(fields.paymentTerms)
  )
    return

  const invoiceDate = resource.get(fields.invoiceDate)?.date
  const paymentTerms = resource.get(fields.paymentTerms)?.number

  if (!invoiceDate || typeof paymentTerms !== 'number') return

  resource.set(fields.paymentDueDate, {
    date: new Date(
      new Date(invoiceDate).getTime() + paymentTerms * millisecondsPerDay,
    ).toISOString(),
  })
}

const recalculateDocumentTotalCost = (resource: TypedResource) => {
  if (
    !resource.implements(
      fields.subtotalCost,
      fields.itemizedCosts,
      fields.totalCost,
    )
  )
    return

  const subtotalCost = resource.get(fields.subtotalCost)?.number ?? 0
  const itemizedCosts = resource.get(fields.itemizedCosts)?.number ?? 0

  resource.set(fields.totalCost, {
    number: subtotalCost + itemizedCosts,
  })
}

const recalculateLineTotalCost = (resource: TypedResource) => {
  if (!resource.implements(fields.unitCost, fields.quantity, fields.totalCost))
    return

  const unitCost = resource.get(fields.unitCost)?.number ?? 0
  const quantity = resource.get(fields.quantity)?.number ?? 0

  resource.set(fields.totalCost, {
    number: unitCost * quantity,
  })
}

const recalculateItemizedCosts = (resource: TypedResource) => {
  if (!resource.implements(fields.subtotalCost, fields.itemizedCosts)) return

  if (!resource.hasPatch(fields.subtotalCost) || !resource.patchedCosts.length)
    return

  const subtotalCost = resource.get(fields.subtotalCost)?.number ?? 0
  const itemizedCosts = resource.costs.reduce(
    (acc, { isPercentage, value }) =>
      acc + (isPercentage ? (value / 100) * subtotalCost : value),
    0,
  )

  resource.set(fields.itemizedCosts, {
    number: itemizedCosts,
  })
}

const setStartDate = (resource: TypedResource) => {
  if (!resource.implements(fields.jobStatus, fields.startDate)) return

  if (
    !resource.patchedFields.some(
      ({ field, valueInput }) =>
        field.templateId === fields.jobStatus.templateId &&
        valueInput.optionId === jobStatusOptions.inProcess.templateId,
    )
  )
    return

  resource.set(fields.startDate, {
    date: new Date().toISOString(),
  })
}

const recalculateProductionDays = (resource: TypedResource) => {
  if (!resource.implements(fields.hours, fields.productionDays)) return

  const hours = resource.get(fields.hours)?.number ?? 0

  resource.set(fields.productionDays, {
    number: Math.ceil(hours / 8),
  })
}

export const deriveFields = (resource: TypedResource) => {
  setStartDate(resource)
  recalculatePaymentDueDateFromNeedDate(resource)
  recalculatePaymentDueDateFromInvoiceDate(resource)
  recalculateLineTotalCost(resource)
  recalculateItemizedCosts(resource)
  recalculateDocumentTotalCost(resource)
  recalculateProductionDays(resource)
}
