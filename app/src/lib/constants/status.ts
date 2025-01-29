import { billStatusOptions, jobStatusOptions } from '@supplyside/model'

export const jobStatusOrder = {
  [jobStatusOptions.draft.templateId]: 1,
  [jobStatusOptions.ordered.templateId]: 2,
  [jobStatusOptions.inProcess.templateId]: 3,
  [jobStatusOptions.shipped.templateId]: 4,
  [jobStatusOptions.invoiced.templateId]: 5,
  [jobStatusOptions.paid.templateId]: 6,
  [jobStatusOptions.canceled.templateId]: 7,
}

export const billStatusOrder = {
  [billStatusOptions.draft.templateId]: 1,
  [billStatusOptions.submitted.templateId]: 2,
  [billStatusOptions.approved.templateId]: 3,
  [billStatusOptions.paid.templateId]: 4,
  [billStatusOptions.canceled.templateId]: 5,
}
