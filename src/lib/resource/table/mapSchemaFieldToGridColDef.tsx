import assert from 'assert'
import { P, match } from 'ts-pattern'
import { FieldType } from '@prisma/client'
import { Box, Chip, Stack } from '@mui/material'
import { Check } from '@mui/icons-material'
import { GridApplyQuickFilter } from '@mui/x-data-grid/models/colDef/gridColDef'
import ContactCard from '../fields/views/ContactCard'
import UserCard from '../fields/views/UserCard'
import ResourceFieldView from '../fields/views/ResourceFieldView'
import FieldGridEditCell from './FieldGridEditCell'
import { Cell, Column, Display, Row } from './types'
import { SchemaField } from '@/domain/schema/entity'
import { findTemplateField } from '@/domain/schema/template/system-fields'
import { formatDate, formatMoney } from '@/lib/format'
import { Value } from '@/domain/resource/entity'
import { selectResourceField } from '@/domain/resource/extensions'
import { emptyValue } from '@/domain/resource/entity'

export const mapSchemaFieldToGridColDef = (
  schemaField: SchemaField,
  options: {
    isEditable: boolean
  },
): Column => ({
  field: schemaField.id,

  headerName: schemaField.name,

  headerAlign: match(schemaField.type)
    .with(P.union('Number', 'Money', 'Checkbox'), () => 'right' as const)
    .otherwise(() => 'left' as const),

  align: match(schemaField.type)
    .with(P.union('Number', 'Money', 'Checkbox'), () => 'right' as const)
    .otherwise(() => 'left' as const),

  width: match(schemaField.type)
    .with('Resource', () => 440)
    .with(P.union('Select', 'MultiSelect'), () => 200)
    .with(P.union('Number', 'Money'), () => 130)
    .with('Date', () => 150)
    .with('Checkbox', () => 100)
    .with(P.union('File', 'Files'), () => 150)
    .with('Contact', () => 300)
    .with('Text', () => 300)
    .with('Textarea', () => 300)
    .with('User', () => 150)
    .exhaustive(),

  editable:
    options.isEditable && !findTemplateField(schemaField.templateId)?.isDerived,

  type: 'custom',

  getApplyQuickFilterFn: (query) => {
    assert(typeof query === 'string', 'Query must be a string')
    return match<FieldType, null | GridApplyQuickFilter<Row, Cell>>(
      schemaField.type,
    )
      .with(
        'Checkbox',
        () => (value) =>
          value?.string
            ?.toLowerCase()
            .includes(schemaField.name.toLowerCase()) ?? false,
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
          formatDate(value?.date)
            ?.toLowerCase()
            .includes(query.toLowerCase()) ?? false,
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
    selectResourceField(resource, { fieldId: schemaField.id })?.value ??
    emptyValue,

  // This function is called when a value is written to the row, prior to persisting the resource.
  valueSetter: (value: Value | undefined = emptyValue, row: Row): Row => {
    const resourceField = selectResourceField(row, { fieldId: schemaField.id })

    return !resourceField
      ? {
          ...row,
          fields: [
            ...row.fields,
            {
              valueId: null,
              fieldId: schemaField.id,
              fieldType: schemaField.type,
              templateId: schemaField.templateId,
              value,
              updatedAt: new Date(),
            },
          ],
        }
      : {
          ...row,
          fields: [
            ...row.fields.filter((f) => f.fieldId !== schemaField.id),
            {
              ...resourceField,
              value,
              updatedAt: new Date(),
            },
          ],
        }
  },

  renderCell: ({ value }) => {
    const children = match<FieldType>(schemaField.type)
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
    const value = selectResourceField(resource, { fieldId: schemaField.id })
    const template = findTemplateField(schemaField.templateId)

    const formatted = match<FieldType>(schemaField.type)
      .with('Date', () => formatDate(value?.value.date) ?? undefined)
      .with('Money', () =>
        value?.value.number?.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }),
      )
      .with('Number', () =>
        template?.prefix && value?.value.number
          ? `${template.prefix} ${value.value.number}`
          : value?.value.number,
      )
      .with(P.union('Text', 'Textarea'), () => value?.value.string)
      .otherwise(() => undefined)

    return formatted ?? ''
  },

  renderEditCell: (params) => (
    <Box display="flex" alignItems="center" height="100%" width="100%">
      <FieldGridEditCell cellParams={params} schemaField={schemaField} />
    </Box>
  ),
})
