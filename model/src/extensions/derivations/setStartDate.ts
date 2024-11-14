import { fields, jobStatusOptions } from '../../templates/fields'
import { IResourceWriter } from '../IResourceWriter'

export const setStartDate = (draft: IResourceWriter) => {
  if (
    !draft.schema.implements(fields.jobStatus, fields.startDate) ||
    !draft.hasPatch(fields.jobStatus) ||
    draft.hasPatch(fields.startDate) ||
    !draft.hasOption(fields.jobStatus, jobStatusOptions.inProcess)
  )
    return

  draft.setDate(fields.startDate, new Date())
}
