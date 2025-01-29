'use client'

import { FC, useState } from 'react'
import { Box, Collapse, Stack, Typography } from '@mui/material'
import { resourceTypes } from '@supplyside/model'
import {
  Add,
  Storage,
  Remove,
  Refresh,
  Close,
  Login,
  DataObject,
} from '@mui/icons-material'
import { usePathname } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { ItemLink } from './NavItem'
import { Account } from '@/client/account'
import { applyTemplateAsAdmin, deleteAccount } from '@/actions/account'
import { useConfirmation } from '@/lib/confirmation'
import { impersonate } from '@/session'

type Props = {
  accounts: Account[]
}

export const Sidenav: FC<Props> = ({ accounts }) => {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string[]>([])
  const confirm = useConfirmation()

  return (
    <>
      {accounts.map((account) => {
        const isExpanded =
          expanded.includes(account.id) || pathname.includes(`/${account.key}/`)
        const expandable = !pathname.includes(`/${account.key}/`)

        return (
          <Box key={account.id}>
            <Stack
              direction="row"
              alignItems="center"
              color="text.secondary"
              onClick={() =>
                setExpanded((expanded) =>
                  expanded.includes(account.id)
                    ? expanded.filter((id) => id !== account.id)
                    : [...expanded, account.id],
                )
              }
              sx={{ cursor: 'pointer' }}
            >
              <Typography variant="overline" flexGrow={1}>
                {account.name}
              </Typography>
              {expandable && (
                <>
                  {isExpanded ? (
                    <Remove sx={{ fontSize: 14 }} />
                  ) : (
                    <Add sx={{ fontSize: 14 }} />
                  )}
                </>
              )}
            </Stack>
            <Collapse in={isExpanded}>
              <Box>
                <ItemLink
                  title="Log In"
                  onClick={() => impersonate(account.id)}
                  icon={<Login />}
                />
                {resourceTypes.map((rt, i) => (
                  <ItemLink
                    key={rt}
                    title={rt}
                    href={`/admin/accounts/${account.key}/${rt.toLowerCase()}`}
                    icon={i === 0 ? <Storage /> : undefined}
                  />
                ))}
                {resourceTypes.map((rt, i) => (
                  <ItemLink
                    key={rt}
                    title={rt}
                    href={`/admin/accounts/${account.key}/schemas/${rt.toLowerCase()}`}
                    icon={i === 0 ? <DataObject /> : undefined}
                  />
                ))}
                <ItemLink
                  title="Apply Template"
                  icon={<Refresh />}
                  onClick={() =>
                    applyTemplateAsAdmin(account.id).then(() => {
                      enqueueSnackbar('Template applied')
                    })
                  }
                />
                <ItemLink
                  title="Delete"
                  onClick={async () => {
                    const isConfirmed = await confirm({
                      title: 'Delete Account',
                      content: 'Are you sure you want to delete this account?',
                    })
                    if (!isConfirmed) return

                    deleteAccount(account.id)
                  }}
                  icon={<Close />}
                />
              </Box>
            </Collapse>
          </Box>
        )
      })}
    </>
  )
}
