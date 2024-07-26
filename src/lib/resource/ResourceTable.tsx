'use client'

import { DataGrid, DataGridProps, GridColDef } from '@mui/x-data-grid'
import { FieldType } from '@prisma/client'
import { Box, Chip, IconButton, Stack } from '@mui/material'
import { Check, Clear } from '@mui/icons-material'
import { P, match } from 'ts-pattern'
import { useMemo } from 'react'
import { difference } from 'remeda'
import ContactCard from './fields/ContactCard'
import { deleteResource } from './actions'
import FieldGridCell from './fields/FieldGridCell'
import FieldControl from './fields/FieldControl'
import { Resource, Value } from '@/domain/resource/types'
import { Schema } from '@/domain/schema/types'
import { selectFields } from '@/domain/schema/selectors'
import { updateValue, UpdateValueDto } from '@/domain/resource/fields/actions'

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
        editable: isEditable,
        //TODO: check if we should we use the default types for sorting?
        // type: match<FieldType, GridColType>(field.type)
        //   .with('Checkbox', () => 'boolean')
        //   .with('Contact', () => 'custom')
        //   .with('Date', () => 'date')
        //   .with('File', () => 'boolean')
        //   .with('Money', () => 'number')
        //   .with('MultiSelect', () => 'custom')
        //   .with('Number', () => 'number')
        //   .with('Resource', () => 'custom')
        //   .with('Textarea', () => 'string')
        //   .with('Select', () => 'singleSelect')
        //   .with('Text', () => 'string')
        //   .with('User', () => 'custom')
        //   .exhaustive(),
        type: 'custom',
        // valueGetter: (_, row) => {
        //   const value = row.fields.find((rf) => rf.fieldId === field.id)?.value

        //   type Primitive = string | number | boolean | null | undefined

        //   return match<FieldType, Primitive>(field.type)
        //     .with('Checkbox', () => value?.boolean)
        //     .with('Contact', () => value?.contact?.name)
        //     .with('Date', () => value?.date?.toISOString())
        //     .with('File', () => !!value?.file)
        //     .with(P.union('Money', 'Number'), () => value?.number)
        //     .with('MultiSelect', () =>
        //       value?.options?.map((o) => o.name).join(' '),
        //     )
        //     .with(P.union('Text', 'Textarea'), () => value?.string)
        //     .with(
        //       'Select',
        //       () =>
        //         // field.options?.find((o) => o.id === value?.option?.id)?.name,
        //         undefined,
        //     )
        //     .with(
        //       'User',
        //       () =>
        //         value?.user &&
        //         `${value.user.firstName} ${value.user.firstName}`,
        //     )
        //     .with('Resource', () => value?.resource?.name)
        //     .exhaustive()
        // },
        valueSetter: (value, row: Resource) => {
          if (!value) return row
          const updatedFields = row.fields.map((f) => ({
            ...f,
            value:
              f.fieldId === field.id
                ? match<FieldType, Value>(f.fieldType)
                    .with('Select', () => ({
                      ...f.value,
                      option: value?.optionId
                        ? {
                            id: value.optionId,
                            name:
                              field.options.find(
                                (option) => option.id === value.optionId,
                              )?.name ?? '',
                          }
                        : null,
                    }))
                    .with('MultiSelect', () => ({
                      ...f.value,
                      options: value?.optionIds
                        ? value.optionIds.map((id: string) => ({
                            id,
                            name:
                              field.options.find((option) => option.id === id)
                                ?.name ?? '',
                          }))
                        : null,
                    }))
                    .otherwise(() => ({ ...f.value, ...value }))
                : f.value,
          }))

          return {
            ...row,
            fields: updatedFields,
          }
        },
        valueFormatter: (_, row) => {
          const value = row.fields.find((rf) => rf.fieldId === field.id)?.value

          return match<FieldType>(field.type)
            .with('Number', () => value?.number)
            .with('Text', () => value?.string)
            .with('Textarea', () => value?.string)
            .with('Date', () => value?.date?.toLocaleDateString())
            .with('Money', () =>
              value?.number?.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              }),
            )
            .with('Resource', () => value?.resource?.name)
            .otherwise(() => undefined)
        },
        renderCell: (params) => {
          const currentField = params.row.fields.find(
            (rf) => rf.fieldId === field.id,
          )

          if (!currentField) return

          const { value } = currentField

          const content = match<FieldType>(field.type)
            .with('Checkbox', () => value?.boolean && <Check />)
            .with(
              'Contact',
              () =>
                value?.contact && (
                  <ContactCard contact={value?.contact} inline />
                ),
            )
            .with(
              'File',
              () =>
                value?.file && (
                  <FieldControl
                    field={field}
                    inputId={`${params.row.id}${field.id}`}
                    resourceId={params.row.id}
                    value={value}
                    isReadOnly
                  />
                ),
            )
            .with('MultiSelect', () => (
              <Stack gap={1} direction="row">
                {value?.options?.map((o) => <Chip key={o.id} label={o.name} />)}
              </Stack>
            ))
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
            .otherwise(() => undefined)

          return (
            content && (
              <Box
                display="flex"
                alignItems="center"
                height="100%"
                width="100%"
              >
                {content}
              </Box>
            )
          )
        },
        renderEditCell: (params) => {
          const currentField = params.row.fields.find(
            (rf) => rf.fieldId === field.id,
          )

          if (!currentField) return

          return (
            <Box display="flex" alignItems="center" height="100%" width="100%">
              <FieldGridCell cellParams={params} field={field} />
            </Box>
          )
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

  const handleProcessRowUpdate = async (newRow: Resource, oldRow: Resource) => {
    // find which cell has been updated
    const editedField = newRow.fields.find(({ fieldId, fieldType, value }) => {
      const oldField = oldRow.fields.find((f) => f.fieldId === fieldId)
      if (!oldField) return
      const { value: oldValue } = oldField
      const hasNewValue = match(fieldType)
        .with('Checkbox', () => oldValue.boolean !== value.boolean)
        .with('Number', () => oldValue.number !== value.number)
        .with('Date', () => oldValue.date !== value.date)
        .with('Money', () => oldValue.number !== value.number)
        .with('Text', () => oldValue.string !== value.string)
        .with('Textarea', () => oldValue.string !== value.string)
        .with('Select', () => oldValue.option?.id !== value.option?.id)
        .with('MultiSelect', () => {
          const newIds = value.options?.map((option) => option.id) ?? []
          const oldIds = oldValue.options?.map((option) => option.id) ?? []

          return (
            !!difference(newIds, oldIds).length ||
            !!difference(oldIds, newIds).length
          )
        })
        .with('User', () => oldValue.user?.id !== value.user?.id)
        .with('Resource', () => oldValue.resource?.id !== value.resource?.id)
        .with(P.union('Contact', 'File'), () => false) //These updates are being handled by the components
        .exhaustive()

      return hasNewValue
    })

    if (!editedField) return newRow

    const { value } = editedField

    const newValue = match<FieldType, UpdateValueDto['value']>(
      editedField.fieldType,
    )
      .with('Checkbox', () => ({ boolean: value.boolean }))
      .with('Number', () => ({ number: value.number }))
      .with('Date', () => ({ date: value.date }))
      .with('Money', () => ({ number: value.number }))
      .with('Text', () => ({ string: value.string }))
      .with('Textarea', () => ({ string: value.string }))
      .with('Select', () => ({ optionId: value.option?.id }))
      .with('MultiSelect', () => ({
        optionIds: value.options?.map((option) => option.id),
      }))
      .with('User', () => ({ userId: value.user?.id }))
      .with('Resource', () => ({ resourceId: value.resource?.id }))
      .with(P.union('Contact', 'File'), () => ({}))
      .exhaustive()

    try {
      await updateValue({
        resourceId: newRow.id,
        fieldId: editedField.fieldId,
        value: newValue,
      })
    } catch {
      //TODO: add error toast
      return oldRow
    }

    return newRow
  }

  return (
    <DataGrid<Resource>
      columns={columns}
      rows={resources}
      rowSelection={false}
      autoHeight
      rowHeight={70}
      processRowUpdate={handleProcessRowUpdate}
      onRowClick={({ row: { type, key } }) => {
        if (type === 'Line') return

        window.location.href = `/${type.toLowerCase()}s/${key}`
      }}
      {...props}
    />
  )
}
