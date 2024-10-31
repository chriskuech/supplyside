'use client'

import { Autocomplete, FormControl, FormLabel, TextField } from '@mui/material'
import { useMemo } from 'react'
import {
  fields,
  jobStatusOptions,
  Schema,
  selectSchemaField,
} from '@supplyside/model'
import { Filters } from './types'

type Props = {
  jobSchema: Schema
  onJobStatusChange: (statuses: { label: string; value: string }[]) => void
  filters: Filters
}

export default function FiltersControl({
  jobSchema,
  onJobStatusChange,
  filters,
}: Props) {
  const allJobStatusOptions = useMemo(
    () =>
      selectSchemaField(jobSchema, fields.jobStatus)?.options.map((option) => ({
        label: option.name,
        value: option.id,
        templateId: option.templateId,
      })) ?? [],
    [jobSchema],
  )

  const jobStatusCurrentOptions = useMemo(
    () =>
      allJobStatusOptions.filter(
        (option) =>
          !filters.jobStatus?.some((value) => value.value === option.value),
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
        value={filters.jobStatus ?? defaultJobStatusOptions}
        onChange={(e, value) => onJobStatusChange(value)}
        multiple
        options={jobStatusCurrentOptions}
        renderInput={(params) => <TextField {...params} />}
        limitTags={3}
      />
    </FormControl>
  )
}
