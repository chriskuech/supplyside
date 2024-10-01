'use client'

import { Autocomplete, TextField } from '@mui/material'
import { ForwardedRef, forwardRef, useEffect, useState } from 'react'
import { enqueueSnackbar } from 'notistack'
import { User } from '@supplyside/model'
import { readUsers } from '@/actions/user'

type Props = {
  inputId: string
  user: User | null
  onChange: (user: User | null) => void
  isReadOnly?: boolean
}

function UserField(
  { user, inputId, onChange, isReadOnly }: Props,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    readUsers()
      .then((users) => setUsers(users ?? []))
      .catch(() =>
        enqueueSnackbar('Failed to load users', { variant: 'error' }),
      )
  }, [])

  return (
    <Autocomplete<User>
      id={inputId}
      fullWidth
      value={user}
      readOnly={isReadOnly}
      onChange={(e, value) => onChange(value)}
      getOptionLabel={(u) => u.name ?? ''}
      options={users}
      renderInput={(params) => <TextField inputRef={ref} {...params} />}
    />
  )
}

export default forwardRef(UserField)
