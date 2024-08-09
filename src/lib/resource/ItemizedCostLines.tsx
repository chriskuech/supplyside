'use client'

import {
  Button,
  Card,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  useTheme,
} from '@mui/material'
import { Add, Clear } from '@mui/icons-material'
import { match } from 'ts-pattern'
import { Resource, selectValue } from '@/domain/resource/types'
import { createCost, deleteCost, updateCost } from '@/domain/cost/actions'
import { fields } from '@/domain/schema/template/system-fields'

type Props = {
  resource: Resource
  onChange: () => void
}

export default function ItemizedCostLines({ resource, onChange }: Props) {
  const theme = useTheme()

  const subtotalCost = selectValue(resource, fields.subtotalCost)?.number ?? 0
  const totalCost = selectValue(resource, fields.totalCost)?.number ?? 0

  return (
    <Stack spacing={2}>
      <Card
        variant="elevation"
        sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
      >
        <Table size="small">
          <TableBody>
            <TableRow
              sx={{
                backgroundColor: match(theme.palette.mode)
                  .with('light', () => 'rgba(0 0 0 / 0.2)')
                  .with('dark', () => 'rgba(255 255 255 / 0.2)')
                  .exhaustive(),
              }}
            >
              <TableCell
                colSpan={2}
                style={{ fontWeight: 'bold', fontSize: '1em', border: 'none' }}
              >
                Subtotal
              </TableCell>
              <TableCell
                align="right"
                style={{ fontWeight: 'bold', fontSize: '1em', border: 'none' }}
              >
                {subtotalCost.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </TableCell>
              <TableCell sx={{ border: 'none' }} />
            </TableRow>

            {resource.costs.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <TextField
                    defaultValue={row.name}
                    onChange={(e) =>
                      updateCost(row.id, { name: e.target.value }).then(() =>
                        onChange?.(),
                      )
                    }
                    placeholder="Description"
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Select
                    sx={{ width: '4rem', textAlign: 'left' }}
                    defaultValue={row.isPercentage ? '%' : '$'}
                    onChange={(e) =>
                      updateCost(row.id, {
                        isPercentage: e.target.value === '%',
                      }).then(() => onChange?.())
                    }
                    size="small"
                  >
                    <MenuItem value="$">$</MenuItem>
                    <MenuItem value="%">%</MenuItem>
                  </Select>
                  <TextField
                    defaultValue={row.value}
                    onChange={(e) =>
                      updateCost(row.id, {
                        value: Number(e.target.value),
                      }).then(() => onChange?.())
                    }
                    type="number"
                    InputProps={{
                      startAdornment: !row.isPercentage && <span>$</span>,
                      endAdornment: row.isPercentage && <span>%</span>,
                    }}
                    size="small"
                    style={{ width: 100, marginLeft: 10 }}
                  />
                </TableCell>
                <TableCell align="right">
                  {(row.isPercentage
                    ? (row.value * (subtotalCost ?? 0)) / 100
                    : row.value
                  ).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => deleteCost(row.id).then(() => onChange?.())}
                  >
                    <Clear />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            <TableRow sx={{ backgroundColor: 'rgba(0 127 255 / 0.3)' }}>
              <TableCell
                colSpan={2}
                style={{ fontWeight: 'bold', fontSize: '1em', border: 'none' }}
              >
                Total
              </TableCell>
              <TableCell
                align="right"
                style={{ fontWeight: 'bold', fontSize: '1em', border: 'none' }}
              >
                {totalCost.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </TableCell>
              <TableCell sx={{ border: 'none' }} />
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <Stack direction={'row'} justifyContent={'end'}>
        <Button
          onClick={() => createCost(resource.id).then(() => onChange?.())}
          startIcon={<Add />}
        >
          Itemized Cost
        </Button>
      </Stack>
    </Stack>
  )
}
