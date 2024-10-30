'use client'

import {
  Autocomplete,
  Badge,
  Button,
  FormControl,
  FormLabel,
  Menu,
  Stack,
  TextField,
} from '@mui/material'
import { GridFilterListIcon } from '@mui/x-data-grid'
import { MouseEvent, useMemo, useState } from 'react'
import { fields, Schema, selectSchemaField } from '@supplyside/model'
import { Filters } from './types'
import { useDisclosure } from '@/hooks/useDisclosure'

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { isOpen, toggle, close } = useDisclosure()

  const activeFilters = Object.values(filters).filter(
    (filterValue) => filterValue.length,
  ).length

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
    toggle()
  }

  const jobStatusOptions = useMemo(
    () =>
      selectSchemaField(jobSchema, fields.jobStatus)?.options.map((option) => ({
        label: option.name,
        value: option.id,
      })) ?? [],
    [jobSchema],
  )

  return (
    <>
      <Button
        size="small"
        variant="text"
        onClick={handleClick}
        startIcon={
          <Badge badgeContent={activeFilters} color="primary">
            <GridFilterListIcon fontSize="small" />
          </Badge>
        }
      >
        <span className="ChartsButtonText">Filters</span>
      </Button>
      <Menu open={isOpen} onClose={close} anchorEl={anchorEl}>
        <Stack width={200} p={2} minWidth={300}>
          <FormControl>
            <FormLabel>Job Status</FormLabel>
            <Autocomplete
              defaultValue={filters.jobStatus}
              onChange={(e, value) => onJobStatusChange(value)}
              multiple
              options={jobStatusOptions}
              renderInput={(params) => <TextField {...params} />}
            />
          </FormControl>
        </Stack>
      </Menu>
    </>
  )
}
