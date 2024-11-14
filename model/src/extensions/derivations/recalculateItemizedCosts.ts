import { fields } from '../../templates/fields'
import { IResourceWriter } from '../IResourceWriter'

export const recalculateItemizedCosts = (draft: IResourceWriter) => {
  if (!draft.schema.implements(fields.subtotalCost, fields.itemizedCosts))
    return

  // TODO: check if costs have been updated

  const subtotalCost = draft.getNumber(fields.subtotalCost) ?? 0

  const itemizedCosts = draft.costs.reduce(
    (acc, { isPercentage, value }) =>
      acc + (isPercentage ? (value / 100) * subtotalCost : value),
    0,
  )

  draft.setNumber(fields.itemizedCosts, itemizedCosts)
}
