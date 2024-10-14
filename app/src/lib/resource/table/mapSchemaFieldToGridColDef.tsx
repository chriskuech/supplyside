import assert from 'assert'
import { P, match } from 'ts-pattern'
import { Box, Chip, Stack } from '@mui/material'
import { Check } from '@mui/icons-material'
import { GridApplyQuickFilter } from '@mui/x-data-grid/models/colDef/gridColDef'
import {
  FieldType,
  SchemaField,
  Value,
  emptyValue,
  findTemplateField,
  formatInlineAddress,
  selectResourceFieldValue,
} from '@supplyside/model'
import {
  getGridBooleanOperators,
  getGridDateOperators,
  getGridNumericOperators,
  getGridStringOperators,
  gridDateComparator,
  GridFilterItem,
  GridFilterOperator,
  gridNumberComparator,
  gridStringOrNumberComparator,
  getGridSingleSelectOperators,
} from '@mui/x-data-grid'
import { MutableRefObject } from 'react'
import { GridApiCommunity } from '@mui/x-data-grid/internals'
import ContactCard from '../fields/views/ContactCard'
import UserCard from '../fields/views/UserCard'
import ResourceFieldView from '../fields/views/ResourceFieldView'
import AddressCard from '../fields/views/AddressCard'
import FieldGridEditCell from './FieldGridEditCell'
import { Cell, Column, Display, Row } from './types'
import { formatDate, formatMoney } from '@/lib/format'

const wrapFilterOperator = (
  operator: GridFilterOperator,
  fieldType: FieldType,
): GridFilterOperator => {
  const getApplyFilterFn = (filterItem: GridFilterItem, column: Column) => {
    const innerFilterFn = operator.getApplyFilterFn(filterItem, column)
    if (!innerFilterFn) return null

    return (
      value: Value,
      row: Row,
      col: Column,
      apiRef: MutableRefObject<GridApiCommunity>,
    ) => {
      const mappedValue = match(fieldType)
        .with(P.union('Text', 'Textarea'), () => value.string)
        .with(P.union('Number', 'Money'), () => value.number)
        .with(
          'Address',
          () => value.address && formatInlineAddress(value.address),
        )
        .with('Checkbox', () => value.boolean)
        .with('Contact', () => value.contact?.name)
        .with('Date', () => value.date)
        .with('File', () => value.file?.name)
        .with('User', () => value.user?.name)
        .with('Resource', () => value.resource?.name)
        .with('Select', () => value.option?.id)
        .with('Files', () =>
          value.files.reduce((value, file) => `${value} ${file.name}`, ''),
        )
        .with('MultiSelect', () => value.options.map((option) => option.id))
        .exhaustive()
      return innerFilterFn(mappedValue, row, col, apiRef)
    }
  }

  return {
    ...operator,
    getApplyFilterFn,
  }
}

export const mapSchemaFieldToGridColDef = (
  field: SchemaField,
  options: {
    isEditable: boolean
    isFilterable?: boolean
  },
): Column => ({
  field: field.fieldId,

  headerName: field.name,

  headerAlign: match(field.type)
    .with(P.union('Number', 'Money', 'Checkbox'), () => 'right' as const)
    .otherwise(() => 'left' as const),

  align: match(field.type)
    .with(P.union('Number', 'Money', 'Checkbox'), () => 'right' as const)
    .otherwise(() => 'left' as const),

  width: match(field.type)
    .with('Resource', () => 440)
    .with(P.union('Select', 'MultiSelect'), () => 200)
    .with(P.union('Number', 'Money'), () => 130)
    .with('Date', () => 150)
    .with('Checkbox', () => 100)
    .with(P.union('File', 'Files'), () => 150)
    .with('Contact', () => 300)
    .with('Text', () => 440)
    .with('Textarea', () => 300)
    .with('User', () => 150)
    .with('Address', () => 300)
    .exhaustive(),

  editable:
    options.isEditable && !findTemplateField(field.templateId)?.isDerived,

  ...(['Select', 'MultiSelect'].includes(field.type)
    ? {
        type: 'singleSelect',
        valueOptions: field.options.map((option) => ({
          label: option.name,
          value: option.id,
        })),
      }
    : {
        type: 'custom',
      }),

  filterable: options.isFilterable,

  filterOperators: match(field.type)
    .with(
      P.union(
        'Address',
        'Contact',
        'File',
        'Files',
        'Resource',
        'Text',
        'Textarea',
        'User',
      ),
      () => getGridStringOperators(),
    )
    .with('Checkbox', () => getGridBooleanOperators())
    .with('Date', () => getGridDateOperators())
    .with(P.union('Money', 'Number'), () => getGridNumericOperators())
    .with(P.union('Select', 'MultiSelect'), () =>
      getGridSingleSelectOperators(),
    )
    .exhaustive()
    .map((operator) => wrapFilterOperator(operator, field.type)),

  sortComparator: (v1, v2, param1, param2) =>
    match(field.type)
      .with('Number', () =>
        gridNumberComparator(v1?.number, v2?.number, param1, param2),
      )
      .with('Address', () =>
        gridStringOrNumberComparator(
          v1?.address && formatInlineAddress(v1.address),
          v2?.address && formatInlineAddress(v2.address),
          param1,
          param2,
        ),
      )
      .with('Checkbox', () =>
        gridStringOrNumberComparator(v1?.boolean, v2?.boolean, param1, param2),
      )
      .with('Contact', () =>
        gridStringOrNumberComparator(
          v1?.contact?.name,
          v2?.contact?.name,
          param1,
          param2,
        ),
      )
      .with('Date', () =>
        gridDateComparator(v1?.date, v2?.date, param1, param2),
      )
      .with('File', () =>
        gridStringOrNumberComparator(
          v1?.file?.name,
          v2?.file?.name,
          param1,
          param2,
        ),
      )
      .with('Files', () =>
        gridStringOrNumberComparator(
          v1?.files.length,
          v2?.files.length,
          param1,
          param2,
        ),
      )
      .with('Money', () =>
        gridStringOrNumberComparator(v1?.number, v2?.number, param1, param2),
      )
      .with('Resource', () =>
        gridStringOrNumberComparator(
          v1?.resource?.name,
          v2?.resource?.name,
          param1,
          param2,
        ),
      )
      .with(P.union('Text', 'Textarea'), () =>
        gridStringOrNumberComparator(v1?.string, v2?.string, param1, param2),
      )
      .with(P.union('User'), () =>
        gridStringOrNumberComparator(
          v1?.user?.name,
          v2?.user?.name,
          param1,
          param2,
        ),
      )
      .with(P.union('Select'), () =>
        gridStringOrNumberComparator(
          v1?.option?.name,
          v2?.option?.name,
          param1,
          param2,
        ),
      )
      .with(P.union('MultiSelect'), () =>
        gridStringOrNumberComparator(
          v1?.options.length,
          v2?.options.length,
          param1,
          param2,
        ),
      )
      .exhaustive(),

  getApplyQuickFilterFn: (query) => {
    assert(typeof query === 'string', 'Query must be a string')
    return match<FieldType, null | GridApplyQuickFilter<Row, Cell>>(field.type)
      .with(
        'Checkbox',
        () => (value) =>
          value?.string?.toLowerCase().includes(field.name.toLowerCase()) ??
          false,
      )
      .with(
        'Address',
        () => (value) =>
          (['streetAddress', 'city', 'state', 'zip', 'country'] as const).some(
            (key) =>
              value?.address?.[key]
                ?.toLowerCase()
                .includes(query.toLowerCase()) ?? false,
          ),
      )
      .with(
        'Contact',
        () => (value) =>
          (['name', 'title', 'email', 'phone'] as const).some(
            (key) =>
              value?.contact?.[key]
                ?.toLowerCase()
                .includes(query.toLowerCase()) ?? false,
          ),
      )
      .with(
        'Date',
        () => (value) =>
          value?.date
            ? (formatDate(new Date(value.date))
                ?.toLowerCase()
                .includes(query.toLowerCase()) ?? false)
            : false,
      )
      .with(
        'File',
        () => (value) =>
          value?.file?.name.toLowerCase().includes(query.toLowerCase()) ??
          false,
      )
      .with(
        'Files',
        () => (value) =>
          value?.files?.some((file) =>
            file.name.toLowerCase().includes(query.toLowerCase()),
          ) ?? false,
      )
      .with(
        'Money',
        () => (value) =>
          formatMoney(value?.number)
            ?.toLowerCase()
            .includes(query.toLowerCase()) ?? false,
      )
      .with(
        'MultiSelect',
        () => (value) =>
          value?.options?.some((option) =>
            option.name.toLowerCase().includes(query.toLowerCase()),
          ) ?? false,
      )
      .with(
        'Number',
        () => (value) =>
          value?.number
            ?.toString()
            .toLowerCase()
            .includes(query.toLowerCase()) ?? false,
      )
      .with(
        'Select',
        () => (value) =>
          value?.option?.name.toLowerCase().includes(query.toLowerCase()) ??
          false,
      )
      .with(
        P.union('Text', 'Textarea'),
        () => (value) =>
          value?.string?.toLowerCase().includes(query.toLowerCase()) ?? false,
      )
      .with(
        'Resource',
        () => (value) =>
          value?.resource?.name.toLowerCase().includes(query.toLowerCase()) ??
          false,
      )
      .with(
        'User',
        () => (value) =>
          value?.user?.name?.toLowerCase().includes(query.toLowerCase()) ||
          value?.user?.email.toLowerCase().includes(query.toLowerCase()) ||
          false,
      )
      .exhaustive()
  },

  valueGetter: (cell: Display, resource: Row): Value =>
    selectResourceFieldValue(resource, field) ?? emptyValue,

  // This function is called when a value is written to the row, prior to persisting the resource.
  valueSetter: (value: Value | undefined = emptyValue, row: Row): Row =>
    !selectResourceFieldValue(row, field)
      ? {
          ...row,
          fields: [
            ...row.fields,
            {
              fieldId: field.fieldId,
              fieldType: field.type,
              name: field.name,
              templateId: field.templateId,
              value,
            },
          ],
        }
      : {
          ...row,
          fields: [
            ...row.fields.filter((f) => f.fieldId !== field.fieldId),
            {
              fieldId: field.fieldId,
              fieldType: field.type,
              name: field.name,
              templateId: field.templateId,
              value,
            },
          ],
        },

  renderCell: ({ value }) => {
    const children = match<FieldType>(field.type)
      .with(
        'Address',
        () =>
          value?.address && (
            <Box onClick={(e) => e.stopPropagation()}>
              <AddressCard address={value.address} inline />
            </Box>
          ),
      )
      .with('Checkbox', () => value?.boolean && <Check />)
      .with(
        'Contact',
        () =>
          value?.contact && (
            <Box onClick={(e) => e.stopPropagation()}>
              <ContactCard contact={value.contact} inline />
            </Box>
          ),
      )
      .with('MultiSelect', () => (
        <Stack gap={1} direction="row">
          {value?.options?.map((option) => (
            <Chip key={option.id} label={option.name} />
          ))}
        </Stack>
      ))
      .with(
        'Resource',
        () =>
          value?.resource && <ResourceFieldView resource={value.resource} />,
      )
      .with('Select', () => value?.option && <Chip label={value.option.name} />)
      .with('User', () => value?.user && <UserCard user={value.user} />)
      .otherwise(() => undefined)

    // Fallback to `valueFormatter`
    if (children === undefined) return undefined

    return (
      <Box display="flex" alignItems="center" height="100%" width="100%">
        {children}
      </Box>
    )
  },

  // Only called if `renderCell` returns `undefined`
  valueFormatter: (_, resource) => {
    const value = selectResourceFieldValue(resource, field)
    const template = findTemplateField(field.templateId)

    const formatted = match<FieldType>(field.type)
      .with('Date', () =>
        value?.date ? formatDate(new Date(value.date)) : undefined,
      )
      .with('Money', () =>
        value?.number?.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }),
      )
      .with('Number', () =>
        template?.prefix && value?.number
          ? `${template.prefix} ${value.number}`
          : value?.number,
      )
      .with(P.union('Text', 'Textarea'), () => value?.string)
      .otherwise(() => undefined)

    return formatted ?? ''
  },

  renderEditCell: (params) => (
    <Box display="flex" alignItems="center" height="100%" width="100%">
      <FieldGridEditCell cellParams={params} field={field} />
    </Box>
  ),
})
