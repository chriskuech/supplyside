'use client'
import { Cost as BaseCost } from '@prisma/client'
import { IconButton, Stack, Typography } from '@mui/material'
import { v4 as uuidv4 } from 'uuid'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Clear } from '@mui/icons-material'
import CreateCostButton from '../cost/CreateCostButton'
import { Resource } from '@/domain/resource/types'
import { deleteCost, readCosts, updateCost } from '@/domain/cost/actions'

type Props = {
  resource: Resource
  subTotal: number
}

interface Cost extends BaseCost {
  subTotal?: number
}

export default function ItemizedCostLines({ resource, subTotal }: Props) {
  const [costData, setCostData] = useState<Cost[]>([])

  const fetchData = useCallback(async () => {
    if (resource.id) {
      const costs: Cost[] = await readCosts(resource.id)
      setCostData(costs)
      return true
    }

    return false
  }, [resource.id])

  const itemizedTotal = useMemo(
    () =>
      costData.reduce(
        (acc, cost) =>
          acc +
          (cost.isPercentage ? (cost.value * subTotal) / 100 : cost.value),
        0,
      ),
    [costData, subTotal],
  )

  const grandTotal = subTotal + itemizedTotal

  const columns = useMemo<GridColDef<Cost>[]>(
    () => [
      {
        field: 'lineNo',
        headerName: '#',
        filterable: false,
        editable: false,
        type: 'number',
        renderCell: (params: GridRenderCellParams) =>
          params.api.getRowIndexRelativeToVisibleRows(params.row.id) + 1,
      },
      { field: 'name', headerName: 'Name', editable: true, type: 'string' },
      {
        field: 'isPercentage',
        headerName: 'Is Percentage',
        type: 'singleSelect',
        valueOptions: [
          { value: false, label: '$' },
          { value: true, label: '%' },
        ],
        editable: true,
      },
      { field: 'value', headerName: 'Value', editable: true, type: 'number' },
      {
        field: 'total',
        headerName: 'Total',
        type: 'number',
        valueGetter: (value: number, row: Cost) => {
          if (!row.value) {
            return 0
          }

          if (row.isPercentage) return (row.value * subTotal) / 100
          else return row.value
        },
        valueFormatter: (value: number) =>
          value?.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          }),
      },
      {
        field: '_delete',
        headerName: 'Delete',
        renderCell: (params: GridRenderCellParams<Cost>) => (
          <IconButton
            onClick={async () => {
              await deleteCost(String(params.row.id))
              await fetchData()
            }}
          >
            <Clear />
          </IconButton>
        ),
      },
    ],
    [fetchData, subTotal],
  )

  useEffect(() => {
    if (resource.id) fetchData()
  }, [fetchData, resource.id])

  const handleProcessRowUpdate = async (newRow: Cost) => {
    try {
      const updatedCost = await updateCost(newRow.id, {
        name: newRow.name,
        isPercentage: newRow.isPercentage,
        value: newRow.value,
      })
      fetchData()
      return updatedCost
    } catch (error) {
      console.error('Error updating row:', error)
      throw error
    }
  }

  const newCost: Cost = {
    id: uuidv4(),
    resourceId: resource.id,
    name: '',
    isPercentage: false,
    value: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return (
    <>
      <Typography variant="h6" align="right" fontSize="1.1rem">
        Subtotal:{' '}
        {subTotal.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
      </Typography>
      <Stack direction="row" alignItems="end" sx={{ p: 1 }}>
        <Typography variant="h6" flexGrow={1}>
          Itemized Costs
        </Typography>
        <CreateCostButton newCost={newCost} fetchData={fetchData} />
      </Stack>
      <DataGrid
        columns={columns}
        rows={costData}
        rowSelection={false}
        slots={{ columnHeaders: () => null }}
        editMode="row"
        autoHeight
        processRowUpdate={handleProcessRowUpdate}
        onProcessRowUpdateError={(error) =>
          console.error('Error updating row:', error)
        }
      />
      <Typography variant="h6" align="right" fontSize="1.1rem">
        Itemized Total:{' '}
        {itemizedTotal.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
      </Typography>
      <Typography variant="h6" align="right">
        Grand Total:{' '}
        {grandTotal.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
      </Typography>
    </>
  )
}
