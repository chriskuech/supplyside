'use client'

import {
  Box,
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
import {
  createCost,
  deleteCost,
  updateCost,
} from '@/domain/resource/cost/actions'
import { fields } from '@/domain/schema/template/system-fields'

type Props = {
  resource: Resource
  isReadOnly?: boolean
}

export default function ItemizedCostLines({ resource, isReadOnly }: Props) {
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
                colSpan={3}
                style={{ fontWeight: 'bold', fontSize: '1em', border: 'none' }}
              >
                Subtotal
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1em',
                  border: 'none',
                  paddingX: '10px',
                }}
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
                <TableCell width={400} sx={{ paddingX: '10px' }}>
                  <TextField
                    defaultValue={row.name}
                    onChange={(e) =>
                      updateCost(row.id, { name: e.target.value })
                    }
                    placeholder="Description"
                    size="small"
                    disabled={isReadOnly}
                  />
                </TableCell>
                <TableCell width={100} sx={{ paddingX: '10px' }}>
                  <Select
                    sx={{ width: '100%', textAlign: 'left' }}
                    defaultValue={row.isPercentage ? '%' : '$'}
                    onChange={(e) =>
                      updateCost(row.id, {
                        isPercentage: e.target.value === '%',
                      })
                    }
                    size="small"
                    disabled={isReadOnly}
                  >
                    <MenuItem value="$">$</MenuItem>
                    <MenuItem value="%">%</MenuItem>
                  </Select>
                </TableCell>
                <TableCell width={120} sx={{ paddingX: '10px' }}>
                  <TextField
                    defaultValue={row.value}
                    onChange={(e) =>
                      updateCost(row.id, {
                        value: Number(e.target.value),
                      })
                    }
                    type="number"
                    InputProps={{
                      startAdornment: !row.isPercentage && <span>$</span>,
                      endAdornment: row.isPercentage && <span>%</span>,
                    }}
                    size="small"
                    disabled={isReadOnly}
                  />
                </TableCell>
                <TableCell align="right" sx={{ paddingX: '10px' }}>
                  {(row.isPercentage
                    ? (row.value * (subtotalCost ?? 0)) / 100
                    : row.value
                  ).toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </TableCell>
                <TableCell>
                  <Box width={40}>
                    {!isReadOnly && (
                      <IconButton onClick={() => deleteCost(row.id)}>
                        <Clear />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            <TableRow sx={{ backgroundColor: 'rgba(0 127 255 / 0.3)' }}>
              <TableCell
                colSpan={3}
                style={{ fontWeight: 'bold', fontSize: '1em', border: 'none' }}
              >
                Total
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1em',
                  border: 'none',
                  paddingX: '10px',
                }}
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

      {!isReadOnly && (
        <Stack direction="row" justifyContent="end">
          <Button onClick={() => createCost(resource.id)} startIcon={<Add />}>
            Itemized Cost
          </Button>
        </Stack>
      )}
    </Stack>
  )
}
