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

  const handleFieldChange = async (
    id: string,
    field: string,
    value: unknown,
  ) => {
    const updatedRow = resource.costs.find((cost) => cost.id === id)
    if (updatedRow) {
      await updateCost(id, {
        ...updatedRow,
        [field]: value,
      })
    }
  }

  const handleDelete = async (id: string) => {
    await deleteCost(id)
  }

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
            {resource.fields.map((field) => {
              if (field.templateId === fields.subtotalCost.templateId) {
                return (
                  <TableRow
                    key={field.fieldId}
                    sx={{ backgroundColor: 'grey.200' }}
                  >
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
                      {field.value.number?.toFixed(2) || subTotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
              }

              return null
            })}
            {resource.costs.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <TextField
                    defaultValue={row.name}
                    onChange={(e) =>
                      handleFieldChange(row.id, 'name', e.target.value)
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
                      handleFieldChange(
                        row.id,
                        'isPercentage',
                        e.target.value === '%',
                      )
                    }
                    size="small"
                  >
                    <MenuItem value="$">$</MenuItem>
                    <MenuItem value="%">%</MenuItem>
                  </Select>
                  <TextField
                    defaultValue={row.value}
                    onChange={(e) =>
                      handleFieldChange(row.id, 'value', Number(e.target.value))
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
                  <IconButton onClick={() => handleDelete(row.id)}>
                    <Clear />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {resource.fields.map((field) => {
              if (field.templateId === fields.itemizedCosts.templateId) {
                return (
                  <TableRow key={field.fieldId}>
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
                      {field.value.number?.toFixed(2) ||
                        itemizedTotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
              }

              if (field.templateId === fields.totalCost.templateId) {
                return (
                  <TableRow
                    key={field.fieldId}
                    sx={{ backgroundColor: '#D5E7EE' }}
                  >
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
                      {field.value.number?.toFixed(2) || grandTotal.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
              }

              return null
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
