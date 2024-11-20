import { FilterAlt } from '@mui/icons-material'
import { InputAdornment, TextField } from '@mui/material'

export type QuickfilterControlProps = {
  filter: string
  onFilterChange: (filter: string) => void
}

export const QuickfilterControl = ({
  filter,
  onFilterChange,
}: QuickfilterControlProps) => (
  <TextField
    defaultValue={filter}
    onChange={(e) => onFilterChange(e.target.value)}
    slotProps={{
      input: {
        placeholder: 'Filter by Part Name or Customer Name',
        startAdornment: (
          <InputAdornment position="start">
            <FilterAlt />
          </InputAdornment>
        ),
      },
    }}
  />
)
