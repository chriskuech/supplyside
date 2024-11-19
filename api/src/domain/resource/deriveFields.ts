import { BadRequestError } from '@supplyside/api/integrations/fastify/BadRequestError'
import { ResourcePatch, fields, jobStatusOptions } from '@supplyside/model'
import dayjs from 'dayjs'
import { isNumber } from 'remeda'

const millisecondsPerDay = 24 * 60 * 60 * 1000

const setInvoiceDate = (patch: ResourcePatch) => {
  if (
    !patch.schema.implements(fields.jobStatus, fields.invoiceDate) ||
    !patch.hasPatch(fields.jobStatus) ||
    !patch.hasOption(fields.jobStatus, jobStatusOptions.invoiced)
  )
    return

  patch.setDate(fields.invoiceDate, new Date().toISOString())
}

const setCompleted = (patch: ResourcePatch) => {
  if (
    !patch.schema.implements(fields.completed, fields.dateCompleted) ||
    !patch.hasPatch(fields.completed)
  )
    return

  patch.setDate(fields.dateCompleted, new Date().toISOString())
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

  if (
    patch.schema.implements(fields.invoiceDate) &&
    patch.getDate(fields.invoiceDate)
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

export const inferSchedulingFields = (patch: ResourcePatch): void => {
  if (
    !patch.schema.implements(
      fields.startDate,
      fields.productionDays,
      fields.deliveryDate,
    ) ||
    !patch.hasAnyPatch(
      fields.startDate,
      fields.productionDays,
      fields.deliveryDate,
    )
  )
    return

  const startDate = patch.getDate(fields.startDate)
  const productionDays = patch.getNumber(fields.productionDays)
  const deliveryDate = patch.getDate(fields.deliveryDate)

  console.log(
    `startDate: ${startDate}, productionDays: ${productionDays}, deliveryDate: ${deliveryDate}, hasAnyPatch: ${patch.hasAnyPatch(
      fields.startDate,
      fields.productionDays,
    )}, hasPatch: ${patch.hasPatch(fields.deliveryDate)}`,
  )
  if (
    patch.hasAnyPatch(fields.startDate, fields.productionDays) &&
    startDate &&
    productionDays
  ) {
    patch.setDate(
      fields.deliveryDate,
      dayjs(startDate).add(productionDays, 'days').toISOString(),
    )

    return
  }

  if (
    !patch.hasPatch(fields.startDate) &&
    patch.hasPatch(fields.deliveryDate) &&
    productionDays
  ) {
    patch.setDate(
      fields.startDate,
      dayjs(deliveryDate).subtract(productionDays, 'days').toISOString(),
    )

    return
  }

  if (
    startDate &&
    productionDays &&
    deliveryDate &&
    dayjs(startDate).add(productionDays, 'days').toISOString() !== deliveryDate
  ) {
    throw new BadRequestError(
      `Start date (${startDate}) + production days (${productionDays}) must equal delivery date (${deliveryDate})`,
    )
  }
}

export const deriveFields = (patch: ResourcePatch) => {
  setCompleted(patch)
  setInvoiceDate(patch)
  setStartDate(patch)
  recalculatePaymentDueDateFromNeedDate(patch)
  recalculatePaymentDueDateFromInvoiceDate(patch)
  recalculateLineTotalCost(patch)
  recalculateItemizedCosts(patch)
  recalculateDocumentTotalCost(patch)
  recalculateProductionDays(patch)
  inferSchedulingFields(patch)
}
