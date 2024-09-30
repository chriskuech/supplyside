'use client'

import { Autocomplete, TextField } from '@mui/material'
import { impersonate } from '@/session'

type Props = {
  account: { id: string; name: string }
  accounts: { id: string; name: string }[]
}

export default function ImpersonationControl({ account, accounts }: Props) {
  return (
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
  )
}
