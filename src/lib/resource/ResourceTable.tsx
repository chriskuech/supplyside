'use client'
import {
  DataGrid,
  GridColDef,
  GridColType,
  DataGridProps,
} from '@mui/x-data-grid'
import { FieldType } from '@prisma/client'
import { Chip, IconButton } from '@mui/material'
import { Check, Clear } from '@mui/icons-material'
import { P, match } from 'ts-pattern'
import { useMemo } from 'react'
import ContactCard from './fields/ContactCard'
import { deleteResource } from './actions'
import { Resource } from '@/domain/resource/types'
import { Schema } from '@/domain/schema/types'
import { selectFields } from '@/domain/schema/selectors'
import { updateValue } from '@/domain/resource/fields/actions'

type Props = {
  schema: Schema
  resources: Resource[]
  isEditable?: boolean
} & Partial<DataGridProps>

export default function ResourceTable({
  schema,
  resources,
  isEditable,
  ...props
}: Props) {
  const columns = useMemo<GridColDef<Resource>[]>(
    () => [
      {
        field: 'key',
        headerName: 'ID',
        type: 'number',
        editable: false,
      },
      ...selectFields(schema).map<GridColDef<Resource>>((field) => ({
        field: field.id,
        headerName: field.name,
        width: 300,
        type: match<FieldType, GridColType>(field.type)
          .with('Checkbox', () => 'boolean')
          .with('Contact', () => 'custom')
          .with('Date', () => 'date')
          .with('File', () => 'boolean')
          .with('Money', () => 'number')
          .with('MultiSelect', () => 'custom')
          .with('Number', () => 'number')
          .with('Resource', () => 'custom')
          .with('Textarea', () => 'string')
          .with('Select', () => 'singleSelect')
          .with('Text', () => 'string')
          .with('User', () => 'custom')
          .exhaustive(),
        editable: isEditable,
        valueSetter: (value, row: Resource) => {
          const updatedFields = row.fields.map((f) => {
            if (value !== undefined && f.fieldId == field.id) {
              const updatedValue = match<FieldType>(field.type)
                .with('Checkbox', () => ({ ...f.value, boolean: value }))
                .with('Contact', () => ({ ...f.value, contact: value.contact }))
                .with('Date', () => ({
                  ...f.value,
                  date: !isNaN(Date.parse(value))
                    ? new Date(value)
                    : f.value.date,
                }))
                .with('File', () => ({ ...f.value, file: value.file }))
                .with('Money', () => ({ ...f.value, number: value }))
                .with('Number', () => ({ ...f.value, number: value }))
                .with('MultiSelect', () => ({
                  ...f.value,
                  options: value.options,
                }))
                .with('Text', () => ({ ...f.value, string: value }))
                .with('Textarea', () => ({ ...f.value, string: value }))
                .with('Select', () => ({ ...f.value, option: value.option }))
                .with('User', () => ({ ...f.value, user: value.user }))
                .with('Resource', () => ({
                  ...f.value,
                  resource: value.resource,
                }))
                .otherwise(() => f.value)
              return {
                ...f,
                value: updatedValue,
              }
            }

            return f
          })
          const updatedRow = {
            ...row,
            fields: updatedFields,
          }
          return updatedRow
        },
        valueGetter: (_, row) => {
          const value = row.fields.find((rf) => rf.fieldId === field.id)?.value
          type Primitive = string | number | boolean | null | undefined

          return match<FieldType, Primitive>(field.type)
            .with('Checkbox', () => value?.boolean)
            .with('Contact', () => value?.contact?.name)
            .with('Date', () => value?.date?.toISOString())
            .with('File', () => !!value?.file)
            .with(P.union('Money', 'Number'), () => value?.number)
            .with('MultiSelect', () =>
              value?.options?.map((o) => o.name).join(' '),
            )
            .with(P.union('Text', 'Textarea'), () => value?.string)
            .with(
              'Select',
              () =>
                field.options?.find((o) => o.id === value?.option?.id)?.name,
            )
            .with(
              'User',
              () =>
                value?.user &&
                `${value.user.firstName} ${value.user.firstName}`,
            )
            .with('Resource', () => value?.resource?.key)
            .exhaustive()
        },
        valueFormatter: (_, row) => {
          const value = row.fields.find((rf) => rf.fieldId === field.id)?.value

          return match<FieldType>(field.type)
            .with('Checkbox', () => value?.boolean && <Check />)
            .with(
              'Contact',
              () => value?.contact && <ContactCard contact={value?.contact} />,
            )
            .with('Date', () => value?.date?.toLocaleDateString())
            .with('File', () => value?.file && <Check />)
            .with('Money', () =>
              value?.number?.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              }),
            )
            .with('Number', () => value?.number)
            .with('MultiSelect', () =>
              value?.options?.map((o) => <Chip key={o.id} label={o.name} />),
            )
            .with(P.union('Text', 'Textarea'), () => value?.string)
            .with('Select', () => {
              const name = field.options?.find(
                (o) => o.id === value?.option?.id,
              )?.name

              return name ? <Chip label={name} /> : undefined
            })
            .with(
              'User',
              () =>
                value?.user &&
                `${value.user.firstName} ${value.user.firstName}`,
            )
            .with('Resource', () => value?.resource?.key)
            .exhaustive()
        },
      })),
      {
        field: '_delete',
        headerName: 'Delete',
        renderCell: ({ row: { id } }) => (
          <IconButton onClick={() => deleteResource({ id })}>
            <Clear />
          </IconButton>
        ),
      },
    ],
    [schema, isEditable],
  )

  const handleProcessRowUpdate = async (newRow: Resource) => {
    // TODO: use single `updateResource` function
    await Promise.all(
      newRow.fields.map((field) =>
        updateValue({
          resourceId: newRow.id,
          fieldId: field.fieldId,
          value: field.value,
        }),
      ),
    )
    return newRow
  }

  return (
    <DataGrid<Resource>
      columns={columns}
      rows={resources}
      rowSelection={false}
      editMode="row"
      autoHeight
      onRowClick={({ row: { type, key } }) => {
        if (type === 'Line') return

        window.location.href = `/${type.toLowerCase()}s/${key}`
      }}
      processRowUpdate={(newRow: Resource) => handleProcessRowUpdate(newRow)}
      onProcessRowUpdateError={(error) => {
        console.error('Error updating row:', error)
      }}
      {...props}
    />
  )
}
