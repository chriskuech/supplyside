'use client'

import { DataGrid, GridColDef, GridColType } from '@mui/x-data-grid'
import { FieldType } from '@prisma/client'
import { Chip, IconButton } from '@mui/material'
import { Check, Delete } from '@mui/icons-material'
import { P, match } from 'ts-pattern'
import { useMemo } from 'react'
import ContactCard from './fields/ContactCard'
import { Resource } from '@/domain/resource/types'
import { Schema } from '@/domain/schema/types'
import { selectFields } from '@/domain/schema/selectors'
import { deleteResource } from '@/domain/resource/actions'

type Props = {
  schema: Schema
  resources: Resource[]
}

export default function ResourceTable({ schema, resources }: Props) {
  const columns = useMemo<GridColDef<Resource>[]>(
    () => [
      {
        field: 'key',
        headerName: 'ID',
        type: 'number',
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
            <Delete />
          </IconButton>
        ),
      },
    ],
    [schema],
  )

  return (
    <DataGrid<Resource>
      columns={columns}
      rows={resources}
      rowSelection={false}
      sx={{ backgroundColor: 'background.paper' }}
      onRowClick={({ row: { type, key } }) => {
        if (type === 'Line') return

        window.location.href = `/${type.toLowerCase()}s/${key}`
      }}
    />
  )
}
