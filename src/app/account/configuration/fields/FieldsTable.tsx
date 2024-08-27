'use client'

import { Clear } from '@mui/icons-material'
import { Card, CardContent, IconButton } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import { FC, useState } from 'react'
import UpdateFieldForm from './UpdateFieldForm'
import { Field, UpdateFieldDto, deleteField, updateField } from './actions'

type Props = {
  fields: Field[]
}

export default function FieldsTable({ fields }: Props) {
  const [field, setField] = useState<Field>()

  const columns: GridColDef<Field>[] = [
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
      renderCell: ({ row }) => (
        <IconButton
          onClick={() => deleteField(row.id)}
          disabled={!!row.templateId}
        >
          <Clear />
        </IconButton>
      ),
    },
  ]

  return (
    <>
      <DataGrid<Field>
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
  field: Field | undefined
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
