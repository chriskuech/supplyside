'use client'

import { FC } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { User } from '@prisma/client'
import { IconButton } from '@mui/material'
import { Delete } from '@mui/icons-material'
import { deleteUser } from './actions'

type Props = {
  users: User[] | undefined
}

const UsersTable: FC<Props> = ({ users }) => {
  const columns: GridColDef<User>[] = [
    {
      field: 'email',
      headerName: 'Email',
      type: 'string',
      width: 250,
      editable: false,
    },
    {
      field: 'firstName',
      headerName: 'First name',
      width: 150,
      editable: false,
    },
    {
      field: 'lastName',
      headerName: 'Last name',
      width: 150,
      editable: false,
    },
    {
      field: '_delete',
      headerName: 'Delete',
      width: 75,
      sortable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <IconButton onClick={() => deleteUser(row.id)}>
          <Delete />
        </IconButton>
      ),
    },
  ]

  return <DataGrid columns={columns} rows={users} rowSelection={false} />
}

export default UsersTable
