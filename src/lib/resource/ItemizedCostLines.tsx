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
} from '@mui/material'
import { Add, Clear } from '@mui/icons-material'
import { Resource } from '@/domain/resource/types'
import { createCost, deleteCost, updateCost } from '@/domain/cost/actions'
import { fields } from '@/domain/schema/template/system-fields'

type Props = {
  resource: Resource
}

export default function ItemizedCostLines({ resource }: Props) {
  const subtotalCost =
    resource.fields.find(
      (rf) => rf.templateId === fields.subtotalCost.templateId,
    )?.value.number ?? 0

  const totalCost =
    resource.fields.find((rf) => rf.templateId === fields.totalCost.templateId)
      ?.value.number ?? 0

  return (
    <Stack spacing={2}>
      <Card variant="elevation">
        <Table size="small">
          <TableBody>
            <TableRow sx={{ backgroundColor: 'grey.200' }}>
              <TableCell
                colSpan={2}
                style={{ fontWeight: 'bold', fontSize: '1em' }}
              >
                Subtotal
              </TableCell>
              <TableCell
                align="right"
                style={{ fontWeight: 'bold', fontSize: '1em' }}
              >
                {subtotalCost.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </TableCell>
              <TableCell />
            </TableRow>

            {resource.costs.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <TextField
                    defaultValue={row.name}
                    onChange={(e) =>
                      updateCost(row.id, { name: e.target.value })
                    }
                    placeholder="Description"
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Select
                    defaultValue={row.isPercentage ? '%' : '$'}
                    onChange={(e) =>
                      updateCost(row.id, {
                        isPercentage: e.target.value === '%',
                      })
                    }
                    size="small"
                  >
                    <MenuItem value="$">$</MenuItem>
                    <MenuItem value="%">%</MenuItem>
                  </Select>
                  <TextField
                    defaultValue={row.value}
                    onChange={(e) =>
                      updateCost(row.id, { value: Number(e.target.value) })
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
                  <IconButton onClick={() => deleteCost(row.id)}>
                    <Clear />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            <TableRow sx={{ backgroundColor: '#D5E7EE' }}>
              <TableCell
                colSpan={2}
                style={{ fontWeight: 'bold', fontSize: '1em' }}
              >
                Total
              </TableCell>
              <TableCell
                align="right"
                style={{ fontWeight: 'bold', fontSize: '1em' }}
              >
                {totalCost.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <Stack direction={'row'} justifyContent={'end'}>
        <Button onClick={() => createCost(resource.id)} startIcon={<Add />}>
          Itemized Cost
        </Button>
      </Stack>
    </Stack>
  )
}
