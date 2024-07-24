'use client'

import {
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo } from 'react'
import { Clear } from '@mui/icons-material'
import CreateCostButton from '../cost/CreateCostButton'
import { Resource } from '@/domain/resource/types'
import { deleteCost, updateCost } from '@/domain/cost/actions'
import { fields } from '@/domain/schema/template/system-fields'
import { updateValue } from '@/domain/resource/fields/actions'

type Props = {
  resource: Resource
  lineResource: Resource[]
}

const calculateSubTotal = (lineResource: Resource[]) =>
  lineResource
    .flatMap((lines) =>
      lines.fields.find(
        (field) => field.templateId === fields.totalCost.templateId,
      ),
    )
    .reduce((sum, obj) => (obj?.value?.number ?? 0) + sum, 0)

const calculateItemizedTotal = (costs: Resource['costs'], subTotal: number) =>
  costs.reduce(
    (acc, cost) =>
      acc + (cost.isPercentage ? (cost.value * subTotal) / 100 : cost.value),
    0,
  )

const updateField = async (
  resource: Resource,
  templateId: string,
  value: number,
) => {
  const field = resource.fields.find((field) => field.templateId === templateId)
  if (field) {
    await updateValue({
      resourceId: resource.id,
      fieldId: field.fieldId,
      value: { number: value },
    })
  }
}

export default function ItemizedCostLines({ resource, lineResource }: Props) {
  const subTotal = useMemo(
    () => calculateSubTotal(lineResource),
    [lineResource],
  )
  const itemizedTotal = useMemo(
    () => calculateItemizedTotal(resource.costs, subTotal),
    [resource.costs, subTotal],
  )
  const grandTotal = subTotal + itemizedTotal

  useEffect(() => {
    const updateTotals = async () => {
      await Promise.all([
        updateField(resource, fields.subtotalCost.templateId, subTotal),
        updateField(resource, fields.itemizedCosts.templateId, itemizedTotal),
        updateField(resource, fields.totalCost.templateId, grandTotal),
      ])
    }

    updateTotals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTotal, itemizedTotal, grandTotal, resource.id])

  const { fields: resourceFields } = resource
  const { subtotalCost, totalCost, itemizedCosts } = fields

  const subtotalField = resourceFields.find(
    ({ templateId }) => templateId === subtotalCost.templateId,
  )
  const totalCostField = resourceFields.find(
    ({ templateId }) => templateId === totalCost.templateId,
  )
  const itemizedCostField = resourceFields.find(
    ({ templateId }) => templateId === itemizedCosts.templateId,
  )
  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack direction="row" alignItems="end" sx={{ p: 1 }}>
        <Typography
          variant="h6"
          flexGrow={1}
          style={{ fontWeight: 'bold', fontSize: '1.15rem' }}
        >
          Itemized Costs
        </Typography>
        <CreateCostButton resourceId={resource.id} />
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow sx={{ backgroundColor: 'grey.200' }}>
              <TableCell
                colSpan={2}
                style={{ fontWeight: 'bold', fontSize: '1.15rem' }}
              >
                Subtotal
              </TableCell>
              <TableCell
                align="right"
                style={{ fontWeight: 'bold', fontSize: '1.15rem' }}
              >
                {subtotalField?.value.number?.toFixed(2)}
              </TableCell>
            </TableRow>

            {resource.costs.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <TextField
                    defaultValue={row.name}
                    onChange={(e) =>
                      updateCost(row.id, { name: e.target.value })
                    }
                    placeholder="Enter Itemized cost ..."
                    size="small"
                    sx={{ width: '50%' }}
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
                      startAdornment: row.isPercentage ? null : <span>$</span>,
                      endAdornment: row.isPercentage ? <span>%</span> : null,
                    }}
                    size="small"
                    style={{ width: 100, marginLeft: 10 }}
                  />
                </TableCell>
                <TableCell align="right">
                  {(row.isPercentage
                    ? (row.value * subTotal) / 100
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

            <TableRow>
              <TableCell
                colSpan={2}
                style={{ fontWeight: 'bold', fontSize: '1.15rem' }}
              >
                Itemized Cost
              </TableCell>
              <TableCell
                align="right"
                style={{ fontWeight: 'bold', fontSize: '1.15rem' }}
              >
                {itemizedCostField?.value.number?.toFixed(2)}
              </TableCell>
            </TableRow>

            <TableRow sx={{ backgroundColor: '#D5E7EE' }}>
              <TableCell
                colSpan={2}
                style={{ fontWeight: 'bold', fontSize: '1.15rem' }}
              >
                Total
              </TableCell>
              <TableCell
                align="right"
                style={{ fontWeight: 'bold', fontSize: '1.15rem' }}
              >
                {totalCostField?.value.number?.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
