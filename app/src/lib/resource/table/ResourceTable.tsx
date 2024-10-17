'use client'

import {
  DataGridPro,
  DataGridProProps,
  GridApiPro,
  GridFilterModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid-pro'
import { CircularProgress, IconButton } from '@mui/material'
import { Clear } from '@mui/icons-material'
import { ComponentType, MutableRefObject, useMemo, useState } from 'react'
import { z } from 'zod'
import { Resource, Schema } from '@supplyside/model'
import { P, match } from 'ts-pattern'
import { useRouter } from 'next/navigation'
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
  initialGridFilterModel?: GridFilterModel
  saveGridFilterModel?: (model: GridFilterModel) => void
  unFilterableFieldIds?: string[]
  Charts?: ComponentType<{ gridApiRef: MutableRefObject<GridApiPro> }>
} & Partial<DataGridProProps<Row>>

export default function ResourceTable({
  tableKey,
  schema,
  resources,
  isEditable = false,
  indexed,
  initialQuery,
  initialGridFilterModel,
  saveGridFilterModel,
  unFilterableFieldIds = [],
  Charts,
  ...props
}: Props) {
  const [isGridRendered, setIsGridRendered] = useState(false)
  const { apiRef, initialState, saveStateToLocalstorage } =
    usePersistDatagridState(tableKey)

  const { push } = useRouter()

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
        mapSchemaFieldToGridColDef(field, {
          isEditable,
          isFilterable: !unFilterableFieldIds.includes(field.fieldId),
        }),
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
    [indexed, schema, isEditable, unFilterableFieldIds],
  )

  if (tableKey && !initialState) return <CircularProgress />

  return (
    <>
      {Charts && isGridRendered && <Charts gridApiRef={apiRef} />}
      <DataGridPro<Row>
        sx={{ paddingTop: '1px' }} // hack to make the "active filter count" bubble overlap
        ref={() => setIsGridRendered(true)}
        apiRef={apiRef}
        columns={columns}
        rows={resources.map((resource, i) => ({ ...resource, index: i + 1 }))}
        editMode="row"
        rowSelection={false}
        autoHeight
        density="standard"
        processRowUpdate={handleProcessRowUpdate}
        onRowClick={({ row: { type, key, id } }: { row: Row }) =>
          match(type)
            .with(P.union('Bill', 'Job', 'Purchase'), () =>
              push(`/${type.toLowerCase()}s/${key}`),
            )
            .with(P.union('Customer', 'Item', 'Vendor'), () =>
              push(window.location.pathname + `?drawerResourceId=${id}`, {
                scroll: false,
              }),
            )
            .with(P.union('JobLine', 'PurchaseLine'), () => null)
            .exhaustive()
        }
        initialState={{
          ...initialState,
          filter: {
            filterModel: {
              items: [],
              ...initialGridFilterModel,
              quickFilterValues: parseQuickFilter(initialQuery ?? ''),
            },
          },
          preferencePanel: { open: false },
        }}
        onColumnVisibilityModelChange={saveStateToLocalstorage}
        onColumnWidthChange={saveStateToLocalstorage}
        onColumnOrderChange={saveStateToLocalstorage}
        onFilterModelChange={saveGridFilterModel}
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
                quickFilterParser={parseQuickFilter}
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
    </>
  )
}

const parseQuickFilter = (searchInput: string) =>
  searchInput
    .split(' ')
    .map((value) => value.trim())
    .filter(Boolean)
