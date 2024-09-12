'use client'

import { Clear } from '@mui/icons-material'
import { Card, CardContent, IconButton, Stack } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import { FC, useState } from 'react'
import UpdateFieldForm from './UpdateFieldForm'
import { deleteField, updateField } from './actions'
import { UpdateFieldDto } from '@/domain/schema/fields'
import { useConfirmation } from '@/lib/confirmation'
import { SchemaField } from '@/domain/schema/entity'

type Props = {
  fields: SchemaField[]
}

export default function FieldsTable({ fields }: Props) {
  const [field, setField] = useState<SchemaField>()
  const confirm = useConfirmation()

  const columns: GridColDef<SchemaField>[] = [
    {
      field: 'name',
      headerName: 'Name',
      type: 'string',
      width: 250,
      editable: false,
    },
    {
      field: 'type',
      headerName: 'Type',
      type: 'singleSelect',
      width: 100,
      editable: false,
    },
    {
      field: 'templateId',
      headerName: 'Template',
      description: 'This field is part of a template and cannot be deleted.',
      type: 'boolean',
      width: 100,
      editable: false,
    },
    {
      field: 'isRequired',
      headerName: 'Required',
      type: 'boolean',
      width: 100,
      editable: false,
    },
    {
      field: 'description',
      headerName: 'Description',
      type: 'string',
      width: 500,
      editable: false,
    },
    {
      field: '_delete',
      headerName: 'Delete',
      type: 'actions',
      width: 75,
      sortable: false,
      disableColumnMenu: true,
      flex: 1,
      headerAlign: 'right',
      align: 'right',
      renderCell: ({ row }) => (
        <IconButton
          onClick={async () => {
            const isConfirmed = await confirm({
              title: 'Delete Field',
              content: (
                <Stack spacing={2}>
                  <Box>
                    Are you sure you want to delete this Field? This will
                    permanently delete any data associated with the Field.
                  </Box>
                  <Box>This action is not reversible.</Box>
                </Stack>
              ),
              confirmButtonText: 'Delete',
            })

            if (!isConfirmed) return

            await deleteField(row.id)
          }}
          disabled={!!row.templateId}
        >
          <Clear />
        </IconButton>
      ),
    },
  ]

  return (
    <>
      <DataGrid<SchemaField>
        columns={columns}
        rows={fields}
        rowSelection={false}
        onRowClick={({ row }) => setField(row)}
      />
      <FieldModal
        field={field}
        onUpdate={updateField}
        onClose={() => setField(undefined)}
      />
    </>
  )
}

const FieldModal: FC<{
  field: SchemaField | undefined
  onUpdate: (dto: UpdateFieldDto) => void
  onClose: () => void
}> = ({ field, onUpdate, onClose }) => (
  <Modal open={!!field} onClose={onClose}>
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'fit-content',
        maxHeight: '100%',
        overflow: 'auto',
      }}
    >
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Edit Field
          </Typography>
          {!!field && (
            <UpdateFieldForm
              key={JSON.stringify(field)}
              field={field}
              onSubmit={(dto) => {
                onUpdate(dto)
                onClose()
              }}
              onCancel={onClose}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  </Modal>
)
