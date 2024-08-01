'use client'

import {
  DataGrid,
  DataGridProps,
  GridColDef,
  GridColType,
} from '@mui/x-data-grid'
import { FieldType } from '@prisma/client'
import { Box, Chip, IconButton, Stack } from '@mui/material'
import { Check, Clear } from '@mui/icons-material'
import { P, match } from 'ts-pattern'
import { useMemo } from 'react'
import { difference } from 'remeda'
import { useSnackbar } from 'notistack'
import ContactCard from './fields/ContactCard'
import { deleteResource } from './actions'
import FieldGridEditCell from './fields/FieldGridEditCell'
import FieldControl from './fields/FieldControl'
import { Resource, ResourceField, Value } from '@/domain/resource/types'
import { Option, Schema } from '@/domain/schema/types'
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
  const { enqueueSnackbar } = useSnackbar()
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
        valueOptions: match(field.type)
          .with('Select', () => field.options)
          .otherwise(() => undefined),
        getOptionLabel: (option: Option) =>
          match(field.type)
            .with('Select', () => option.name)
            .otherwise(() => undefined),
        getOptionValue: (option: Option) =>
          match(field.type)
            .with('Select', () => option.id)
            .otherwise(() => undefined),
        type: match<FieldType, GridColType>(field.type)
          .with('Textarea', () => 'string')
          .with('Text', () => 'string')
          .with('Money', () => 'number')
          .with('Number', () => 'number')
          .with('Checkbox', () => 'boolean')
          .with('File', () => 'boolean')
          .with('Date', () => 'date')
          .with('Select', () => 'singleSelect')
          .with('Contact', () => 'custom')
          .with('MultiSelect', () => 'custom')
          .with('Resource', () => 'custom')
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
            .with('Select', () => value?.option?.id)
            .with(
              'User',
              () =>
                value?.user &&
                `${value.user.firstName} ${value.user.firstName}`,
            )
            .with('Resource', () => value?.resource?.name)
            .exhaustive()
        },
        valueParser: (value) => value,
        valueSetter: (value, row: Resource) => {
          if (typeof value !== 'object') return row //TODO: check why value is the raw value 'example' instead of an object {string: 'example'} or similar for other field types when entering edit mode
          const emptyValue: Value = {
            boolean: null,
            contact: null,
            date: null,
            file: null,
            number: null,
            option: null,
            resource: null,
            string: null,
            user: null,
          }

          const updatedValue = match<FieldType, Value>(field.type)
            .with('Select', () => ({
              ...emptyValue,
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
              ...emptyValue,
              options: value?.optionIds
                ? value.optionIds.map((id: string) => ({
                    id,
                    name:
                      field.options.find((option) => option.id === id)?.name ??
                      '',
                  }))
                : null,
            }))
            //TODO: get user information
            .with('User', () => ({
              ...emptyValue,
              user: {
                id: value.userId,
                email: '...',
                firstName: '...',
                fullName: '...',
                lastName: '...',
                profilePicPath: null,
              },
            }))
            .otherwise(() => ({ ...emptyValue, ...value }))

          const editedField = row.fields.find((f) => f.fieldId === field.id)
          if (!editedField) {
            const newField: ResourceField = {
              fieldId: field.id,
              fieldType: field.type,
              templateId: field.templateId,
              value: updatedValue,
            }

            return { ...row, fields: [...row.fields, newField] }
          } else {
            const otherFields = row.fields.filter((f) => f.fieldId !== field.id)

            const updatedField = { ...editedField, value: updatedValue }

            return {
              ...row,
              fields: [...otherFields, updatedField],
            }
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
                  <ContactCard contact={value.contact} inline />
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
        renderEditCell: (params) => (
          <Box display="flex" alignItems="center" height="100%" width="100%">
            <FieldGridEditCell cellParams={params} field={field} />
          </Box>
        ),
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
      .with('Select', () => ({ optionId: value.option?.id ?? null }))
      .with('MultiSelect', () => ({
        optionIds: value.options?.map((option) => option.id) ?? null,
      }))
      .with('User', () => ({ userId: value.user?.id ?? null }))
      .with('Resource', () => ({ resourceId: value.resource?.id ?? null }))
      .with(P.union('Contact', 'File'), () => ({}))
      .exhaustive()

    try {
      await updateValue({
        resourceId: newRow.id,
        fieldId: editedField.fieldId,
        value: newValue,
      })
    } catch {
      enqueueSnackbar('There was an error updating the field', {
        variant: 'error',
      })
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
      density="standard"
      processRowUpdate={handleProcessRowUpdate}
      onRowClick={({ row: { type, key } }) => {
        if (type === 'Line') return

        window.location.href = `/${type.toLowerCase()}s/${key}`
      }}
      {...props}
    />
  )
}
