import { fields } from '../../templates/fields'
import { IResourceWriter } from '../IResourceWriter'

const millisecondsPerDay = 24 * 60 * 60 * 1000

export const recalculatePaymentDueDateFromNeedDate = (
  draft: IResourceWriter,
) => {
  if (
    !draft.schema.implements(
      fields.needDate,
      fields.paymentTerms,
      fields.paymentDueDate,
    ) ||
    !draft.hasAnyPatch(fields.needDate, fields.paymentTerms) ||
    draft.hasPatch(fields.paymentDueDate)
  )
    return

  const needDate = draft.getDate(fields.needDate)
  const paymentTerms = draft.getNumber(fields.paymentTerms)

  if (needDate === null || paymentTerms === null) return

  draft.setDate(
    fields.paymentDueDate,
    new Date(new Date(needDate).getTime() + paymentTerms * millisecondsPerDay),
  )
}
