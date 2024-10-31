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
  [jobStatusOptions.draft.templateId]: grey[400],
  [jobStatusOptions.ordered.templateId]: purple[400],
  [jobStatusOptions.inProcess.templateId]: lightBlue[400],
  [jobStatusOptions.shipped.templateId]: blue[600],
  [jobStatusOptions.invoiced.templateId]: lightGreen[400],
  [jobStatusOptions.paid.templateId]: green[600],
  [jobStatusOptions.canceled.templateId]: red[400],
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
  [billStatusOptions.draft.templateId]: grey[400],
  [billStatusOptions.submitted.templateId]: purple[400],
  [billStatusOptions.approved.templateId]: blue[600],
  [billStatusOptions.paid.templateId]: green[600],
  [billStatusOptions.canceled.templateId]: red[400],
}

export const billStatusOrder = {
  [billStatusOptions.draft.templateId]: 1,
  [billStatusOptions.submitted.templateId]: 2,
  [billStatusOptions.approved.templateId]: 3,
  [billStatusOptions.paid.templateId]: 4,
  [billStatusOptions.canceled.templateId]: 5,
}
