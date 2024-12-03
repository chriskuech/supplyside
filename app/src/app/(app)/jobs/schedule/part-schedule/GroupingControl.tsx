'use client'

import { Build, PrecisionManufacturing } from '@mui/icons-material'
import {
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material'

type GroupingControlProps = {
  grouping: 'workCenter' | 'job'
  onGroupingChange: (grouping: 'workCenter' | 'job') => void
}

export const GroupingControl = ({
  grouping,
  onGroupingChange,
}: GroupingControlProps) => (
  <FormControlLabel
    label="Group by"
    labelPlacement="start"
    slotProps={{ typography: { sx: { pl: 0, pr: 2 } } }}
    control={
      <ToggleButtonGroup
        value={grouping}
        onChange={(_, value) => value && onGroupingChange(value)}
        size="small"
        exclusive
      >
        <Tooltip title="Group by Work Center">
          <ToggleButton value="workCenter" key="workCenter">
            <PrecisionManufacturing fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Group by Job">
          <ToggleButton value="job" key="job">
            <Build fontSize="small" />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    }
  />
)
