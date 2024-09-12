'use client'

import { DataGridPro, DataGridProProps } from '@mui/x-data-grid-pro'
import { CircularProgress, IconButton } from '@mui/material'
import { Clear } from '@mui/icons-material'
import { useMemo } from 'react'
import { deleteResource } from '../actions'
import CustomGridToolbar from './CustomGridToolbar'
import { mapSchemaFieldToGridColDef } from './mapSchemaFieldToGridColDef'
import { Row, Column } from './types'
import { handleProcessRowUpdate } from './processRowUpdate'
import { usePersistDatagridState } from './usePersistDatagridState'
import { Resource } from '@/domain/resource/entity'
import { Schema } from '@/domain/schema/entity'

type Props = {
  tableKey?: string
  schema: Schema
  resources: Resource[]
  isEditable?: boolean
  indexed?: boolean
} & Partial<DataGridProProps>

export default function ResourceTable({
  tableKey,
  schema,
  resources,
  isEditable = false,
  indexed,
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
      ...schema.allFields.map((field) =>
        mapSchemaFieldToGridColDef(field, { isEditable }),
      ),
      ...(isEditable
        ? [
            {
              field: '_delete',
              headerName: 'Delete',
              renderCell: ({ row: { id } }) => (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteResource({ id })
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
      initialState={{ ...initialState, preferencePanel: { open: false } }}
      onColumnVisibilityModelChange={saveStateToLocalstorage}
      onColumnWidthChange={saveStateToLocalstorage}
      onColumnOrderChange={saveStateToLocalstorage}
      onSortModelChange={saveStateToLocalstorage}
      slots={{ toolbar: CustomGridToolbar }}
      {...props}
    />
  )
}
