import { P, match } from 'ts-pattern'
import { FieldType } from '@prisma/client'
import { Box, Chip, Stack } from '@mui/material'
import { Check } from '@mui/icons-material'
import ContactCard from '../fields/views/ContactCard'
import UserCard from '../fields/views/UserCard'
import ResourceFieldView from '../fields/views/ResourceFieldView'
import FieldGridEditCell from './FieldGridEditCell'
import { Column, Display, Row } from './types'
import { Field } from '@/domain/schema/types'
import { findTemplateField } from '@/domain/schema/template/system-fields'
import { formatDate } from '@/lib/formatDate'
import { Value } from '@/domain/resource/entity'
import { selectResourceField } from '@/domain/resource/extensions'
import { emptyValue } from '@/domain/resource/entity'

export const mapSchemaFieldToGridColDef = (
  field: Field,
  options: {
    isEditable: boolean
  },
): Column => ({
  field: field.id,

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
    .with('Text', () => 300)
    .with('Textarea', () => 300)
    .with('User', () => 150)
    .exhaustive(),

  editable:
    options.isEditable && !findTemplateField(field.templateId)?.isDerived,

  type: 'custom',

  valueGetter: (cell: Display, resource: Row): Value =>
    selectResourceField(resource, { fieldId: field.id }) ?? emptyValue,

  // This function is called when a value is written to the row, prior to persisting the resource.
  valueSetter: (value: Value | undefined = emptyValue, row: Row): Row =>
    !selectResourceField(row, { fieldId: field.id })
      ? {
          ...row,
          fields: [
            ...row.fields,
            {
              fieldId: field.id,
              fieldType: field.type,
              templateId: field.templateId,
              value,
            },
          ],
        }
      : {
          ...row,
          fields: [
            ...row.fields.filter((f) => f.fieldId !== field.id),
            {
              fieldId: field.id,
              fieldType: field.type,
              templateId: field.templateId,
              value,
            },
          ],
        },

  renderCell: ({ value }) => {
    const children = match<FieldType>(field.type)
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
    const value = selectResourceField(resource, { fieldId: field.id })
    const template = findTemplateField(field.templateId)

    const formatted = match<FieldType>(field.type)
      .with('Date', () => formatDate(value?.date) ?? undefined)
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
