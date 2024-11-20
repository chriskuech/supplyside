'use client'

import {
  DataGridPro,
  DataGridProProps,
  GridApiPro,
  GridFilterModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid-pro'
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material'
import {
  BarChart,
  Clear,
  ExpandLess,
  ExpandMore,
  PieChart,
} from '@mui/icons-material'
import { ComponentType, MutableRefObject, useMemo, useState } from 'react'
import { z } from 'zod'
import {
  fields,
  FieldTemplate,
  Resource,
  Schema,
  SchemaData,
} from '@supplyside/model'
import { P, match } from 'ts-pattern'
import { useRouter } from 'next/navigation'
import { mapSchemaFieldToGridColDef } from './mapSchemaFieldToGridColDef'
import { Row, Column } from './types'
import { handleProcessRowUpdate } from './processRowUpdate'
import { usePersistDatagridState } from './usePersistDatagridState'
import { deleteResource, deleteResourceAsAdmin } from '@/actions/resource'

type FieldNames = keyof typeof fields
export type ColumnWidths = Partial<Record<FieldNames, number>>

function isValidColumnWidth(
  columnWidths: ColumnWidths | undefined,
  key: string,
): key is keyof ColumnWidths {
  return columnWidths !== undefined && key in columnWidths
}

type Props = {
  tableKey?: string
  schemaData: SchemaData
  resources: Resource[]
  isEditable?: boolean
  indexed?: boolean
  initialQuery?: string
  initialGridFilterModel?: GridFilterModel
  hideId?: boolean
  saveGridFilterModel?: (model: GridFilterModel) => void
  unFilterableFieldIds?: string[]
  Charts?: ComponentType<{
    gridApiRef: MutableRefObject<GridApiPro>
    recurringResources?: Resource[]
  }>
  specialColumnWidths?: ColumnWidths
  recurringResources?: Resource[]
  isAdmin?: boolean
  hideFields?: FieldTemplate[]
} & Partial<DataGridProProps<Row>>

export default function ResourceTable({
  tableKey,
  schemaData,
  resources,
  isEditable = false,
  indexed,
  initialQuery,
  initialGridFilterModel,
  saveGridFilterModel,
  unFilterableFieldIds = [],
  Charts,
  specialColumnWidths,
  recurringResources,
  hideFields,
  hideId,
  isAdmin = false,
  ...props
}: Props) {
  const schema = new Schema({
    ...schemaData,
    fields: schemaData.fields.filter(
      (field) => !hideFields?.some((f) => f.templateId === field.templateId),
    ),
  })
  const isChartsEnabled = Charts !== undefined
  const [showCharts, setShowCharts] = useState(isChartsEnabled)
  const [isGridRendered, setIsGridRendered] = useState(false)
  const { apiRef, initialState, saveStateToLocalstorage } =
    usePersistDatagridState(tableKey)

  const { push } = useRouter()

  const columns = useMemo<Column[]>(
    () => [
      ...(indexed
        ? [
            {
              field: 'index',
              headerName: '#',
              type: 'number',
              editable: false,
              width: 30,
            } satisfies Column,
          ]
        : !hideId
          ? [
              {
                field: 'key',
                headerName: 'ID',
                type: 'number',
                editable: false,
              } satisfies Column,
            ]
          : []),
      ...schema.fields.map((field) =>
        mapSchemaFieldToGridColDef(field, {
          isEditable,
          isFilterable: !unFilterableFieldIds.includes(field.fieldId),
          width: isValidColumnWidth(specialColumnWidths, field.name)
            ? specialColumnWidths?.[field.name]
            : undefined,
        }),
      ),
      ...(isEditable
        ? [
            {
              field: '_delete',
              headerName: 'Delete',
              renderCell: ({ row: { accountId, id: resourceId } }) => (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    isAdmin
                      ? deleteResourceAsAdmin(accountId, resourceId)
                      : deleteResource(resourceId)
                  }}
                >
                  <Clear />
                </IconButton>
              ),
            } satisfies Column,
          ]
        : []),
    ],
    [
      indexed,
      hideId,
      schema.fields,
      isEditable,
      unFilterableFieldIds,
      specialColumnWidths,
      isAdmin,
    ],
  )

  if (tableKey && !initialState) return <CircularProgress />

  return (
    <>
      {isChartsEnabled && (
        <Collapse in={showCharts} timeout="auto" unmountOnExit>
          <Box pb={4}>
            {isGridRendered && (
              <Charts
                gridApiRef={apiRef}
                recurringResources={recurringResources}
              />
            )}
          </Box>
        </Collapse>
      )}
      <DataGridPro<Row>
        sx={{ paddingTop: '1px' }} // hack to make the "active filter count" bubble overlap
        ref={() => setIsGridRendered(true)}
        apiRef={apiRef}
        columns={columns}
        rows={resources.map((resource, i) => ({ ...resource, index: i + 1 }))}
        editMode="cell"
        rowSelection={false}
        autoHeight
        density="standard"
        processRowUpdate={handleProcessRowUpdate}
        onRowClick={({ row: { type, key, id } }: { row: Row }) =>
          match(type)
            .with(P.union('Bill', 'Job', 'Purchase', 'WorkCenter'), () =>
              push(`/${type.toLowerCase()}s/${key}`),
            )
            .with(P.union('Customer', 'Vendor'), () =>
              push(window.location.pathname + `?drawerResourceId=${id}`, {
                scroll: false,
              }),
            )
            .with(
              P.union('Operation', 'Part', 'PurchaseLine', 'Step'),
              () => null,
            )
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
                sx={{ flexGrow: 1, maxWidth: '700px' }}
                debounceMs={200} // time before applying the new quick filter value
              />
              <Box flexGrow={1} />
              <GridToolbarExport slotProps={{ button: { variant: 'text' } }} />
              <Divider orientation="vertical" flexItem />
              <GridToolbarColumnsButton
                slotProps={{ button: { variant: 'text' } }}
              />
              <GridToolbarFilterButton
                slotProps={{ button: { variant: 'text' } }}
              />
              {isChartsEnabled && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <Tooltip title={`${showCharts ? 'Hide' : 'Show'} Charts`}>
                    <Button
                      onClick={() => setShowCharts((e) => !e)}
                      size="small"
                      variant="text"
                      startIcon={
                        <Stack direction="row">
                          <PieChart fontSize="small" />
                          <BarChart fontSize="small" />
                        </Stack>
                      }
                      endIcon={showCharts ? <ExpandLess /> : <ExpandMore />}
                    >
                      Charts
                    </Button>
                  </Tooltip>
                </>
              )}
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
