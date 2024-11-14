import { fields } from '../../templates/fields'
import { IResourceWriter } from '../IResourceWriter'

export const recalculateDocumentTotalCost = (draft: IResourceWriter) => {
  if (
    !draft.schema.implements(fields.subtotalCost, fields.itemizedCosts) ||
    !draft.hasAnyPatch(fields.subtotalCost, fields.itemizedCosts)
  )
    return

  const subtotalCost = draft.getNumber(fields.subtotalCost) ?? 0
  const itemizedCosts = draft.getNumber(fields.itemizedCosts) ?? 0

  draft.setNumber(fields.totalCost, subtotalCost + itemizedCosts)
}
