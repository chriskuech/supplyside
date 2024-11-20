'use client'

import { Autocomplete, TextField } from '@mui/material'
import { jobStatusOptions, OptionTemplate } from '@supplyside/model'
import { values } from 'remeda'

type Props = {
  jobStatuses: OptionTemplate[] | null
  onJobStatusChange: (statuses: OptionTemplate[]) => void
}

export default function JobStatusFilterControl({
  jobStatuses,
  onJobStatusChange,
}: Props) {
  const allOptions = values(jobStatusOptions).map((option) => ({
    id: option.templateId,
    name: option.name,
    color: option.color,
  }))
  const currentOptions = allOptions.filter((option) =>
    jobStatuses?.some((value) => value.templateId === option.id),
  )
  const availableOptions = allOptions.filter(
    (option) => !currentOptions.some((value) => value.id === option.id),
  )

  return (
    <Autocomplete
      value={currentOptions}
      onChange={(e, options) =>
        onJobStatusChange(
          values(jobStatusOptions).filter((option) =>
            options.some((value) => value.id === option.templateId),
          ),
        )
      }
      getOptionLabel={(option) => option.name}
      multiple
      options={availableOptions}
      renderInput={(params) => <TextField {...params} />}
      ChipProps={{ size: 'small', sx: { fontSize: '12px', padding: 0 } }}
    />
  )
}
