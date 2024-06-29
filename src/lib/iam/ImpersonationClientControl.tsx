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
      size="small"
      renderInput={(params) => <TextField {...params} />}
      getOptionLabel={(o) => o.name}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      options={accounts}
      value={account}
      onChange={(e, value) => onChange(value.id)}
    />
  )
}
