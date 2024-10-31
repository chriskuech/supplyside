import {
  blue,
  green,
  grey,
  lightBlue,
  lightGreen,
  purple,
  red,
} from '@mui/material/colors'
import { billStatusOptions, jobStatusOptions } from '@supplyside/model'

export const jobStatusColors = {
  [jobStatusOptions.draft.templateId]: grey[300],
  [jobStatusOptions.ordered.templateId]: purple[300],
  [jobStatusOptions.inProcess.templateId]: lightBlue[300],
  [jobStatusOptions.shipped.templateId]: blue[500],
  [jobStatusOptions.invoiced.templateId]: lightGreen[300],
  [jobStatusOptions.paid.templateId]: green[500],
  [jobStatusOptions.canceled.templateId]: red[300],
}

export const jobStatusOrder = {
  [jobStatusOptions.draft.templateId]: 1,
  [jobStatusOptions.ordered.templateId]: 2,
  [jobStatusOptions.inProcess.templateId]: 3,
  [jobStatusOptions.shipped.templateId]: 4,
  [jobStatusOptions.invoiced.templateId]: 5,
  [jobStatusOptions.paid.templateId]: 6,
  [jobStatusOptions.canceled.templateId]: 7,
}

export const billStatusColors = {
  [billStatusOptions.draft.templateId]: grey[300],
  [billStatusOptions.submitted.templateId]: purple[300],
  [billStatusOptions.approved.templateId]: blue[500],
  [billStatusOptions.paid.templateId]: green[500],
  [billStatusOptions.canceled.templateId]: red[300],
}

export const billStatusOrder = {
  [billStatusOptions.draft.templateId]: 1,
  [billStatusOptions.submitted.templateId]: 2,
  [billStatusOptions.approved.templateId]: 3,
  [billStatusOptions.paid.templateId]: 4,
  [billStatusOptions.canceled.templateId]: 5,
}
