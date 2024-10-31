'use client'

import { Autocomplete, FormControl, FormLabel, TextField } from '@mui/material'
import { useMemo } from 'react'
import {
  fields,
  jobStatusOptions,
  Option,
  Schema,
  selectSchemaField,
} from '@supplyside/model'

type Props = {
  jobSchema: Schema
  onJobStatusChange: (statuses: Option[]) => void
  filters: {
    jobStatuses: Option[] | null
  }
}

export default function FiltersControl({
  jobSchema,
  onJobStatusChange,
  filters,
}: Props) {
  const allJobStatusOptions = useMemo(
    () => selectSchemaField(jobSchema, fields.jobStatus)?.options ?? [],
    [jobSchema],
  )

  const jobStatusCurrentOptions = useMemo(
    () =>
      allJobStatusOptions.filter(
        (option) =>
          !filters.jobStatuses?.some(
            (value) => value.templateId === option.templateId,
          ),
      ),
    [allJobStatusOptions, filters],
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
        value={filters.jobStatuses ?? defaultJobStatusOptions}
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
