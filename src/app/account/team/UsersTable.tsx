'use client'

import { FC, useState } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { IconButton } from '@mui/material'
import { Clear } from '@mui/icons-material'
import { filter, fromEntries, keys, map, pipe } from 'remeda'
import { deleteUser, updateUser } from './actions'
import { systemAccountId } from '@/lib/const'
import { User } from '@/domain/iam/user/types'
import { useDisclosure } from '@/lib/hooks/useDisclosure'
import ConfirmationDialog from '@/lib/ux/ConfirmationDialog'

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
  const { isOpen, close, open } = useDisclosure()
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null)

  const editable: boolean =
    currentUser?.isAdmin || currentUser?.accountId === systemAccountId

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
        <IconButton
          onClick={() => {
            setUserIdToDelete(row.id)
            open()
          }}
        >
          <Clear />
        </IconButton>
      ),
    },
  ]

  return (
    <>
      <ConfirmationDialog
        title="Delete User"
        content="Are you sure you want to delete this user?"
        isOpen={isOpen}
        onClose={close}
        onConfirm={() => {
          if (userIdToDelete) {
            deleteUser(userIdToDelete)
          }

          setUserIdToDelete(null)

          close()
        }}
      />
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
    </>
  )
}

export default UsersTable
