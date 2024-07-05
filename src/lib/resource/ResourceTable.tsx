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
import { useMemo, useState } from 'react'
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
  const [rows, setRows] = useState(resources)

  const columns = useMemo<GridColDef<Resource>[]>(
    () => [
      {
        field: 'key',
        headerName: 'ID',
        type: 'number',
        editable: isEditable,
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

  const handleProcessRowUpdate = async (newRow: any) => {
    const updatedFields = newRow.fields.map((field: any) => {
      const newValue = newRow[field.fieldId]
      if (newValue !== undefined) {
        const updatedField = {
          ...field,
          value: {
            ...field.value,
            number:
              typeof newValue === 'number' ? newValue : field.value.number,
            date:
              typeof newValue === 'object' && !isNaN(Date.parse(newValue))
                ? new Date(newValue)
                : field.value.date,
            string:
              typeof newValue === 'string' ? newValue : field.value.string,
          },
        }

        updateValue({
          resourceId: newRow.id,
          fieldId: field.fieldId,
          value: updatedField.value,
        })
      }

      return field
    })

    const updatedRow = {
      ...newRow,
      fields: updatedFields,
    }

    updatedRow.fields.forEach((field: any) => {
      delete updatedRow[field.fieldId]
    })

    setRows((prevRows) =>
      prevRows.map((row) => (row.id === updatedRow.id ? updatedRow : row)),
    )
    return updatedRow
  }

  return (
    <DataGrid<Resource>
      columns={columns}
      rows={resources}
      rowSelection={false}
      editMode="row"
      autoHeight
      sx={{ backgroundColor: 'background.paper' }}
      onRowClick={({ row: { type, key } }) => {
        if (type === 'Line') return

        window.location.href = `/${type.toLowerCase()}s/${key}`
      }}
      processRowUpdate={(newRow) => handleProcessRowUpdate(newRow)}
      onProcessRowUpdateError={(error) => {
        console.error('Error updating row:', error)
      }}
      {...props}
    />
  )
}
