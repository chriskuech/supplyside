import { isNumber } from 'remeda'
import { fields } from '../../templates/fields'
import { IResourceWriter } from '../IResourceWriter'

export const recalculateProductionDays = (draft: IResourceWriter) => {
  if (
    !draft.schema.implements(fields.hours, fields.productionDays) ||
    !draft.hasPatch(fields.hours)
  )
    return

  const hours = draft.getNumber(fields.hours)

  if (!isNumber(hours)) return

  draft.setNumber(fields.productionDays, Math.ceil(hours / 8))
}
