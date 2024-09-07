import { GridColType } from '@mui/x-data-grid-pro'
import { P, match } from 'ts-pattern'
import { FieldType } from '@prisma/client'
import { Box, Chip, Link, Stack } from '@mui/material'
import { Check } from '@mui/icons-material'
import NextLink from 'next/link'
import ContactCard from '../fields/views/ContactCard'
import UserCard from '../fields/views/UserCard'
import FieldGridEditCell from './FieldGridEditCell'
import { Column, Row } from './types'
import { Field } from '@/domain/schema/types'
import { findTemplateField } from '@/domain/schema/template/system-fields'
import { formatDate } from '@/lib/formatDate'
import { Value } from '@/domain/resource/values/types'
import { selectResourceField } from '@/domain/resource/types'

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

  // valueOptions: match(field.type)
  //   .with('Select', () => field.options)
  //   .otherwise(() => undefined),

  // getOptionLabel: (options: ValueOptions) =>
  //   match(field.type)
  //     .with('Select', () => options.name)
  //     .otherwise(() => undefined),

  // getOptionValue: (options: ValueOptions) =>
  //   match(field.type)
  //     .with('Select', () => options.id)
  //     .otherwise(() => undefined),

  type: match<FieldType, GridColType>(field.type)
    .with('Checkbox', () => 'boolean')
    .with('File', () => 'boolean')
    .with('Files', () => 'boolean')

    .with('Date', () => 'date')

    .with('Money', () => 'number')
    .with('Number', () => 'number')

    .with('Text', () => 'string')
    .with('Textarea', () => 'string')

    .with('Select', () => 'singleSelect')

    .with('Contact', () => 'custom')
    .with('MultiSelect', () => 'custom')
    .with('Resource', () => 'custom')
    .with('User', () => 'custom')

    .exhaustive(),

  // // TODO: Might be needed for Search
  // valueGetter: (cell: Display, resource: Row): Value => {
  //   const value = resource.fields.find((rf) => rf.fieldId === field.id)?.value

  //   return match<FieldType>(field.type)
  //     .with('Checkbox', () => value?.boolean)
  //     .with('Contact', () => value?.contact?.name)
  //     .with('Date', () => value?.date?.toISOString())
  //     .with('File', () => !!value?.file?.name)
  //     .with(P.union('Money', 'Number'), () => value?.number)
  //     .with('MultiSelect', () => value?.options?.map((o) => o.name).join(' '))
  //     .with(P.union('Text', 'Textarea'), () => value?.string)
  //     .with('Select', () => value?.option?.name)
  //     .with('User', () => value?.user?.fullName)
  //     .with('Resource', () => value?.resource?.name)
  //     .with('Files', () => !!value?.files?.length)
  //     .exhaustive()
  // },

  // valueParser: (value) => emptyValue, // TODOs

  // This function is called when a value is written to the row prior to the row prior to persisting.
  valueSetter: (value: Value, row: Row): Row =>
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

  // This is the first function called when rendering a cell. It produces a primitive (rather than JSX) for performance.
  valueFormatter: (_, resource) => {
    const value = selectResourceField(resource, { fieldId: field.id })

    return match<FieldType>(field.type)
      .with('Date', () => formatDate(value?.date) ?? undefined)
      .with('Money', () =>
        value?.number?.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        }),
      )
      .with('Number', () => value?.number)
      .with(P.union('Text', 'Textarea'), () => value?.string)
      .otherwise(() => undefined)
  },

  // This is called to render the cell if `valueFormatter` returns `undefined`
  renderCell: ({ row: resource }) => {
    const value = selectResourceField(resource, { fieldId: field.id })

    return (
      <Box display="flex" alignItems="center" height="100%" width="100%">
        {match<FieldType>(field.type)
          .with('Checkbox', () => value?.boolean && <Check />)
          .with('Contact', () => (
            <Box onClick={(e) => e.stopPropagation()}>
              <ContactCard contact={value?.contact ?? null} inline />
            </Box>
          ))
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
              value?.resource && (
                <Link
                  component={NextLink}
                  href={`/${value.resource.type.toLowerCase()}s/${value.resource.key}`}
                >
                  {value.resource.name}
                </Link>
              ),
          )
          .with(
            'Select',
            () => value?.option && <Chip label={value.option.name} />,
          )
          .with('User', () => value?.user && <UserCard user={value.user} />)
          .otherwise(() => undefined)}
      </Box>
    )
  },

  renderEditCell: (params) => (
    <Box display="flex" alignItems="center" height="100%" width="100%">
      <FieldGridEditCell cellParams={params} field={field} />
    </Box>
  ),
})
