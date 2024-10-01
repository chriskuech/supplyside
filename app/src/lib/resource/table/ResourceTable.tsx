'use client'
import {
  DataGridPro,
  DataGridProProps,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid-pro'
import { CircularProgress, IconButton } from '@mui/material'
import { Clear } from '@mui/icons-material'
import { useMemo } from 'react'
import { z } from 'zod'
import { Resource, Schema } from '@supplyside/model'
import { mapSchemaFieldToGridColDef } from './mapSchemaFieldToGridColDef'
import { Row, Column } from './types'
import { handleProcessRowUpdate } from './processRowUpdate'
import { usePersistDatagridState } from './usePersistDatagridState'
import { deleteResource } from '@/actions/resource'

type Props = {
  tableKey?: string
  schema: Schema
  resources: Resource[]
  isEditable?: boolean
  indexed?: boolean
  initialQuery?: string
} & Partial<DataGridProProps<Row>>

export default function ResourceTable({
  tableKey,
  schema,
  resources,
  isEditable = false,
  indexed,
  initialQuery,
  ...props
}: Props) {
  const { apiRef, initialState, saveStateToLocalstorage } =
    usePersistDatagridState(tableKey)

  const columns = useMemo<Column[]>(
    () => [
      indexed
        ? {
            field: 'index',
            headerName: '#',
            type: 'number',
            editable: false,
            width: 30,
          }
        : {
            field: 'key',
            headerName: 'ID',
            type: 'number',
            editable: false,
          },
      ...schema.fields.map((field) =>
        mapSchemaFieldToGridColDef(field, { isEditable }),
      ),
      ...(isEditable
        ? [
            {
              field: '_delete',
              headerName: 'Delete',
              renderCell: ({ row: { id: resourceId } }) => (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteResource(resourceId)
                  }}
                >
                  <Clear />
                </IconButton>
              ),
            } satisfies Column,
          ]
        : []),
    ],
    [indexed, schema, isEditable],
  )

  if (tableKey && !initialState) return <CircularProgress />

  return (
    <DataGridPro<Row>
      columns={columns}
      rows={resources.map((resource, i) => ({ ...resource, index: i + 1 }))}
      editMode="row"
      rowSelection={false}
      autoHeight
      density="standard"
      processRowUpdate={handleProcessRowUpdate}
      onRowClick={({ row: { type, key } }) => {
        if (type === 'Line') return

        window.location.href = `/${type.toLowerCase()}s/${key}`
      }}
      apiRef={apiRef}
      initialState={{
        ...initialState,
        filter: {
          filterModel: {
            items: [],
            quickFilterValues: parseFilter(initialQuery ?? ''),
          },
        },
        preferencePanel: { open: false },
      }}
      onColumnVisibilityModelChange={saveStateToLocalstorage}
      onColumnWidthChange={saveStateToLocalstorage}
      onColumnOrderChange={saveStateToLocalstorage}
      onSortModelChange={saveStateToLocalstorage}
      slots={{
        toolbar: () => (
          <GridToolbarContainer>
            <GridToolbarColumnsButton
              slotProps={{ button: { variant: 'text' } }}
            />
            <GridToolbarFilterButton
              slotProps={{ button: { variant: 'text' } }}
            />
            <GridToolbarQuickFilter
              quickFilterParser={parseFilter}
              quickFilterFormatter={(quickFilterValues) =>
                z
                  .array(z.string().nullable().optional())
                  .parse(quickFilterValues)
                  .map((value) => value?.trim())
                  .filter(Boolean)
                  .join(' ')
              }
              debounceMs={200} // time before applying the new quick filter value
            />
          </GridToolbarContainer>
        ),
      }}
      {...props}
    />
  )
}

const parseFilter = (searchInput: string) =>
  searchInput
    .split(' ')
    .map((value) => value.trim())
    .filter(Boolean)
