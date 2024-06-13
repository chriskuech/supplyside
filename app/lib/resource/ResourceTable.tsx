'use client'

import { DataGrid, GridColDef, GridColType } from '@mui/x-data-grid'
import { FieldType } from '@prisma/client'
import { Chip, IconButton } from '@mui/material'
import { Check, Delete } from '@mui/icons-material'
import { P, match } from 'ts-pattern'
import { useMemo } from 'react'
import { selectFields } from '../schema/selectors'
import { Schema } from '../schema/types'
import { deleteResource } from './actions'
import { Resource } from './types'

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
          .with('Money', () => 'number')
          .with('MultiSelect', () => 'custom')
          .with('Number', () => 'number')
          .with('RichText', () => 'string')
          .with('Select', () => 'singleSelect')
          .with('Text', () => 'string')
          .with('User', () => 'custom')
          .exhaustive(),
        valueGetter: (_, row) => {
          const value = row.fields.find((rf) => rf.fieldId === field.id)?.value

          return match(field.type)
            .with(FieldType.Checkbox, () => value?.boolean)
            .with(
              P.union(FieldType.Money, FieldType.Number),
              () => value?.number,
            )
            .with(FieldType.MultiSelect, () =>
              value?.options?.map((o) => o.name),
            )
            .with(
              P.union(FieldType.Text, FieldType.RichText),
              () => value?.string,
            )
            .with(FieldType.Select, () =>
              field.options?.find((o) => o.id === value?.option?.id),
            )
            .with(
              FieldType.User,
              () =>
                value?.user &&
                `${value.user.firstName} ${value.user.firstName}`,
            )
            .exhaustive()
        },
        valueFormatter: (_, row) => {
          const value = row.fields.find((rf) => rf.fieldId === field.id)?.value

          return match(field.type)
            .with(FieldType.Checkbox, () => value?.boolean && <Check />)
            .with(FieldType.Money, () =>
              value?.number?.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              }),
            )
            .with(FieldType.Number, () => value?.number)
            .with(FieldType.MultiSelect, () =>
              value?.options?.map((o) => <Chip key={o.id} label={o.name} />),
            )
            .with(
              P.union(FieldType.Text, FieldType.RichText),
              () => value?.string,
            )
            .with(FieldType.Select, () => {
              const name = field.options?.find(
                (o) => o.id === value?.option?.id,
              )?.name

              return name ? <Chip label={name} /> : undefined
            })
            .with(
              FieldType.User,
              () =>
                value?.user &&
                `${value.user.firstName} ${value.user.firstName}`,
            )
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
      onRowClick={({ row: { type, key } }) => {
        if (type === 'Line') return

        window.location.href = `/${type.toLowerCase()}s/${key}`
      }}
    />
  )
}
