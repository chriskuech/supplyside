'use client'

import { Autocomplete, TextField } from '@mui/material'

type Props = {
  account: { id: string; name: string }
  accounts: { id: string; name: string }[]
  onChange: (accountId: string) => void
}

export default function ImpersonationClientControl({
  account,
  accounts,
  onChange,
}: Props) {
  return (
    <Autocomplete
      fullWidth
      disableClearable
      renderInput={(params) => <TextField {...params} />}
      getOptionLabel={(o) => o.name}
      options={accounts}
      value={account}
      onChange={(e, value) => onChange(value.id)}
    />
  )
}
