'use client'

import {
  Autocomplete,
  Box,
  Button,
  Fade,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material'
import NextLink from 'next/link'
import { useState } from 'react'
import { User } from '@supplyside/model'
import { impersonate } from '@/session'

type Props = {
  user: User
  account: { id: string; name: string }
  accounts: { id: string; name: string }[]
}

export default function AdminMenu({ user, account, accounts }: Props) {
  const [isHover, setIsHover] = useState(false)

  return (
    <Box
      position="relative"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <Tooltip title="Manage Accounts">
        <Button
          variant="text"
          color="warning"
          component={NextLink}
          href="/admin"
          size="small"
          onClick={() => impersonate(user.accountId)}
        >
          {account.name}
        </Button>
      </Tooltip>
      <Fade in={isHover} timeout={300}>
        <Stack
          width={350}
          height="100%"
          position="absolute"
          top={0}
          left="100%"
          zIndex={100}
          justifyContent="center"
          pl={1}
        >
          <Box bgcolor="warning.main" p={0.5} borderRadius={0.5}>
            <Autocomplete
              fullWidth
              disableClearable
              size="small"
              renderInput={(params) => <TextField {...params} />}
              getOptionLabel={(o) => o.name}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              options={accounts}
              value={account}
              onChange={(e, value) => impersonate(value.id)}
            />
          </Box>
        </Stack>
      </Fade>
    </Box>
  )
}
