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
          editable: field.name !== 'Subtotal Cost' && isEditable,
          valueSetter: (value, row: Resource) => {
            const getFieldId = (name: string) =>
              selectFields(schema).find((field) => field.name === name)?.id;
          
            const quantityFieldId = getFieldId('Quantity');
            const unitCostFieldId = getFieldId('Unit Cost');
            const totalCostFieldId = getFieldId('Subtotal Cost');
          
            const updatedFields = row.fields.map((f) => {
              if (value !== undefined && f.fieldId === field.id) {
                return {
                  ...f,
                  value: {
                    ...f.value,
                    number: typeof value === 'number' ? value : f.value.number,
                    string: typeof value === 'string' ? value : f.value.string,
                    date:
                      typeof value === 'object' && !isNaN(Date.parse(value))
                        ? new Date(value)
                        : f.value.date,
                  },
                }
              }
              return f;
            });
          
            const getFieldValue = (id: string | undefined) =>
              updatedFields.find((f) => f.fieldId === id)?.value.number ?? null;
          
            const quantity = getFieldValue(quantityFieldId);
            const unitCost = getFieldValue(unitCostFieldId);
          
            if (quantity !== null && unitCost !== null) {
              const totalCost = quantity * unitCost;
              const totalCostFieldIndex = updatedFields.findIndex(
                (f) => f.fieldId === totalCostFieldId
              );
          
              if (totalCostFieldIndex !== -1) {
                updatedFields[totalCostFieldIndex] = {
                  ...updatedFields[totalCostFieldIndex],
                  value: {
                    ...updatedFields[totalCostFieldIndex].value,
                    number: totalCost,
                  },
                };
              }
            }
          
            return { ...row, fields: updatedFields };
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
    newRow.fields.map((field) => {
      updateValue({
        resourceId: newRow.id,
        fieldId: field.fieldId,
        value: field.value,
      })
    })
    console.log("RRR ",newRow)
    return newRow
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
      processRowUpdate={(newRow: Resource) => handleProcessRowUpdate(newRow)}
      onProcessRowUpdateError={(error) => {
        console.error('Error updating row:', error)
      }}
      {...props}
    />
  )
}