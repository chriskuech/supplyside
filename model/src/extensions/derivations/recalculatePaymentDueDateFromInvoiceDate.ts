import { fields } from '../../templates/fields'
import { IResourceWriter } from '../IResourceWriter'

export const recalculatePaymentDueDateFromInvoiceDate = (
  draft: IResourceWriter,
) => {
  if (
    !draft.schema.implements(
      fields.invoiceDate,
      fields.paymentTerms,
      fields.paymentDueDate,
    ) ||
    !draft.hasAnyPatch(fields.invoiceDate, fields.paymentTerms) ||
    draft.hasPatch(fields.paymentDueDate)
  )
    return

  const invoiceDate = draft.getDate(fields.invoiceDate)
  const paymentTerms = draft.getNumber(fields.paymentTerms)

  if (invoiceDate === null || paymentTerms === null) return

  draft.setDate(
    fields.paymentDueDate,
    new Date(
      new Date(invoiceDate).getTime() + paymentTerms * 24 * 60 * 60 * 1000,
    ),
  )
}
