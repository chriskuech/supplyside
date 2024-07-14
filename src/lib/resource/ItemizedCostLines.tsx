'use client'
import { Cost as BaseCost } from '@prisma/client'
import { IconButton, Stack, Typography } from '@mui/material'
import { v4 as uuidv4 } from 'uuid'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useEffect, useState } from 'react'
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

declare module '@mui/x-data-grid' {
  interface FooterPropsOverrides {
    resource: Resource
    subTotal: number
  }
}

export default function ItemizedCostLines({ resource, subTotal }: Props) {
  // export default function ItemizedCostLines(
  //   props: GridSlotsComponentsProps['footer'] & Props,
  // ) {
  // const { resource, subTotal } = props
  const [costData, setCostData] = useState<Cost[]>([])
  const fetchData = async () => {
    const costs: Cost[] = await readCosts(resource.id)
    setCostData(costs)
    return true
  }

  const itemizedTotal = costData.reduce((acc, cost) => {
    const totalValue = cost.isPercentage
      ? (cost.value * subTotal) / 100
      : cost.value
    return acc + totalValue
  }, 0)

  const grandTotal = subTotal + itemizedTotal
  const columns: GridColDef<Cost>[] = [
    {
      field: 'lineNo',
      headerName: '#',
      filterable: false,
      editable: false,
      type: 'number',
      renderCell: (params: GridRenderCellParams) =>
        params.api.getRowIndexRelativeToVisibleRows(params.row.id) + 1,
    },
    {
      field: 'name',
      headerName: 'Name',
      // width: 200,
      editable: true,
      type: 'string',
    },
    {
      field: 'isPercentage',
      headerName: 'Is Percentage',
      // width: 150,
      type: 'singleSelect',
      valueOptions: [
        { value: false, label: '$' },
        { value: true, label: '%' },
      ],
      editable: true,
    },
    {
      field: 'value',
      headerName: 'Value',
      // width: 150,
      editable: true,
      type: 'number',
    },
    {
      field: 'total',
      headerName: 'Total',
      // width: 150,
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
      renderCell: (row: GridRenderCellParams<Cost>) => {
        const id = String(row.id)
        return (
          <IconButton
            onClick={() => {
              deleteCost(id)
              fetchData()
            }}
          >
            <Clear />
          </IconButton>
        )
      },
    },
  ]

  useEffect(() => {
    if (resource.id) {
      fetchData()
    }
  }, [])

  const handleProcessRowUpdate = async (newRow: Cost) => {
    try {
      const updatedCost = await updateCost(newRow.id, {
        name: newRow.name,
        isPercentage: newRow.isPercentage,
        value: newRow.value,
      })
      return updatedCost // Return the updated row for DataGrid
    } catch (error) {
      console.error('Error updating row:', error)
      throw error // Optionally throw to trigger onProcessRowUpdateError
    }
  }

  const newCost: Cost = {
    id: uuidv4(), // Optional, as it will be auto-generated
    resourceId: resource.id, // Assuming resource.id is a valid string
    name: '', // Provide default or required value
    isPercentage: false, // Default value
    value: 0, // Default value
    createdAt: new Date(), // Optional, depending on your model
    updatedAt: new Date(), // Optional, depending on your model
  }

  return (
    <>
      <Typography variant="h6" flexGrow={1} align="right" fontSize={'1.1rem'}>
        Subtotal:{' '}
        {subTotal.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
      </Typography>
      <Stack
        direction={'row'}
        alignItems={'end'}
        sx={{
          p: 1,
          // maxWidth: '500px'
        }}
      >
        <Typography variant="h6" flexGrow={1}>
          Itemized Costs
        </Typography>
        <CreateCostButton newCost={newCost} fetchData={fetchData} />
      </Stack>
      <DataGrid<Cost>
        columns={columns}
        rows={costData}
        rowSelection={false}
        // sx={{ maxWidth: '500px' }}
        slots={{
          columnHeaders: () => null,
        }}
        editMode="row"
        autoHeight
        processRowUpdate={(newRow: Cost) => handleProcessRowUpdate(newRow)}
        onProcessRowUpdateError={(error) => {
          console.error('Error updating row:', error)
        }}
      />
      <Typography variant="h6" flexGrow={1} align="right" fontSize={'1.1rem'}>
        Itemized Total:{' '}
        {itemizedTotal.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
      </Typography>
      <Typography variant="h6" flexGrow={1} align="right">
        Grand Total:{' '}
        {grandTotal.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
      </Typography>
    </>
  )
}
