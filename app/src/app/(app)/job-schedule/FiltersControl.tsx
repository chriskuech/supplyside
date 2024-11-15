'use client'

import { Autocomplete, FormControl, FormLabel, TextField } from '@mui/material'
import { useMemo } from 'react'
import {
  fields,
  jobStatusOptions,
  Option,
  Schema,
  SchemaData,
} from '@supplyside/model'

type Props = {
  jobSchemaData: SchemaData
  onJobStatusChange: (statuses: Option[]) => void
  jobStatuses: Option[] | null
}

export default function JobStatusFilterControl({
  jobSchemaData,
  onJobStatusChange,
  jobStatuses,
}: Props) {
  const allJobStatusOptions = useMemo(
    () => new Schema(jobSchemaData).getField(fields.jobStatus).options,
    [jobSchemaData],
  )

  const jobStatusCurrentOptions = useMemo(
    () =>
      allJobStatusOptions.filter(
        (option) =>
          !jobStatuses?.some((value) => value.templateId === option.templateId),
      ),
    [allJobStatusOptions, jobStatuses],
  )

  const defaultJobStatusOptions = useMemo(
    () =>
      allJobStatusOptions.filter(
        (option) =>
          option.templateId &&
          [
            jobStatusOptions.draft.templateId,
            jobStatusOptions.ordered.templateId,
            jobStatusOptions.inProcess.templateId,
            jobStatusOptions.shipped.templateId,
          ].includes(option.templateId),
      ),
    [allJobStatusOptions],
  )

  return (
    <FormControl>
      <FormLabel>Job Status</FormLabel>
      <Autocomplete
        value={jobStatuses ?? defaultJobStatusOptions}
        onChange={(e, value) => onJobStatusChange(value)}
        getOptionLabel={(option) => option.name}
        multiple
        options={jobStatusCurrentOptions}
        renderInput={(params) => <TextField {...params} />}
        limitTags={3}
      />
    </FormControl>
  )
}
