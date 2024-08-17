'use client'

import { FC } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { IconButton } from '@mui/material'
import { Clear } from '@mui/icons-material'
import { filter, fromEntries, keys, map, pipe } from 'remeda'
import { deleteUser, updateUser } from './actions'
import { User } from '@/domain/iam/user/types'

/**
 * @param oldObj
 * @param newObj
 * @returns an object containing the values in newObj that are different from oldObj
 */
const diff = <T extends Record<string, unknown>>(
  oldObj: T,
  newObj: T,
): Partial<T> =>
  pipe(
    keys(newObj),
    filter((key: keyof T) => newObj[key] !== oldObj[key]),
    map(<K extends keyof T>(key: K): [K, T[K]] => [key, newObj[key]]),
    fromEntries(),
  ) as Partial<T>

type Props = {
  currentUser: User
  users: User[] | undefined
}

const UsersTable: FC<Props> = ({ currentUser, users }) => {
  const editable = currentUser.isAdmin || currentUser.isGlobalAdmin

  const columns: GridColDef<User>[] = [
    {
      field: 'email',
      headerName: 'Email',
      type: 'string',
      width: 250,
      editable,
    },
    {
      field: 'firstName',
      headerName: 'First name',
      type: 'string',
      width: 150,
      editable,
    },
    {
      field: 'lastName',
      headerName: 'Last name',
      type: 'string',
      width: 150,
      editable,
    },
    {
      field: 'isApprover',
      headerName: 'Approver?',
      type: 'boolean',
      width: 50,
      editable,
    },
    {
      field: 'isAdmin',
      headerName: 'Admin?',
      type: 'boolean',
      width: 50,
      editable,
    },
    {
      field: '_delete',
      headerName: 'Delete',
      width: 75,
      sortable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <IconButton onClick={() => deleteUser(row.id)}>
          <Clear />
        </IconButton>
      ),
    },
  ]

  return (
    <DataGrid
      columns={columns}
      rows={users}
      rowSelection={false}
      processRowUpdate={async (newRow, oldRow) => {
        const patch = diff(oldRow, newRow)

        await updateUser({
          id: newRow.id,
          ...patch,
        })

        return newRow
      }}
    />
  )
}

export default UsersTable
