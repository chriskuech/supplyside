import { fields } from '../../templates/fields'
import { IResourceWriter } from '../IResourceWriter'

export const recalculateLineTotalCost = (draft: IResourceWriter) => {
  if (
    !draft.schema.implements(
      fields.unitCost,
      fields.quantity,
      fields.totalCost,
    ) ||
    !draft.hasAnyPatch(fields.unitCost, fields.quantity)
  )
    return

  const unitCost = draft.getNumber(fields.unitCost) ?? 0
  const quantity = draft.getNumber(fields.quantity) ?? 0

  draft.setNumber(fields.totalCost, unitCost * quantity)
}
