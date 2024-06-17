'use client'

import { Delete, Sync } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Account } from '@prisma/client'
import { systemAccountId } from '@/lib/const'

type Props = {
  accounts: Account[]
  onRowClick: (accountId: string) => void
}

export default function AccountsTable({ accounts, onRowClick }: Props) {
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
          getActions: ({ row: { id: accountId } }) => [
            <IconButton key="sync">
              <Sync />
            </IconButton>,
            ...(accountId !== systemAccountId
              ? [
                  <IconButton key="delete">
                    <Delete />
                  </IconButton>,
                ]
              : []),
          ],
        },
      ]}
      rows={accounts}
      rowSelection={false}
      onRowClick={({ row: { id } }) => onRowClick(id)}
    />
  )
}
