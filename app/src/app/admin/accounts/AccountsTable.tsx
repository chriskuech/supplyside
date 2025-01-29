'use client'

import { Clear, Sync } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { closeSnackbar, enqueueSnackbar } from 'notistack'
import { systemAccountId } from '@/lib/const'
import { Account } from '@/client/account'
import { applyTemplateAsAdmin, deleteAccount } from '@/actions/account'
import { impersonate } from '@/session'

type Props = {
  accounts: Account[]
}

export default function AccountsTable({ accounts }: Props) {
  return (
    <DataGrid
      columns={[
        {
          field: 'name',
          headerName: 'Name',
          type: 'string',
          editable: true,
          flex: 1,
        },
        {
          field: 'createdAt',
          headerName: 'Created At',
          type: 'dateTime',
          width: 200,
        },
        {
          field: 'updatedAt',
          headerName: 'Updated At',
          type: 'dateTime',
          width: 200,
        },
        {
          field: 'actions',
          headerName: 'Actions',
          type: 'actions',
          getActions: ({ row: { id: accountId } }) =>
            accountId !== systemAccountId
              ? [
                  <IconButton
                    key="sync"
                    onClick={() => {
                      const key = enqueueSnackbar('Applying the template...')
                      applyTemplateAsAdmin(accountId)
                        .then(() => {
                          closeSnackbar(key)
                          enqueueSnackbar('Template successfully applied', {
                            variant: 'success',
                          })
                        })
                        .catch(() => {
                          closeSnackbar(key)
                          enqueueSnackbar(
                            'There was an error applying the template',
                            { variant: 'error' },
                          )
                        })
                    }}
                  >
                    <Sync />
                  </IconButton>,
                  <IconButton
                    key="delete"
                    onClick={() => deleteAccount(accountId)}
                  >
                    <Clear />
                  </IconButton>,
                ]
              : [],
        },
      ]}
      rows={accounts}
      rowSelection={false}
      onRowClick={({ row: { id } }) => impersonate(id)}
    />
  )
}
