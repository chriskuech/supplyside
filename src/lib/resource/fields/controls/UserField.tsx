'use client'

import { MenuItem, Select } from '@mui/material'
import { ForwardedRef, forwardRef, useEffect, useState } from 'react'
import { enqueueSnackbar } from 'notistack'
import { readUsersAction } from './actions'
import { User } from '@/domain/user/entity'

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
    readUsersAction()
      .then(setUsers)
      .catch(() =>
        enqueueSnackbar('Failed to load users', { variant: 'error' }),
      )
  }, [])

  return (
    <Select
      inputRef={ref}
      id={inputId}
      fullWidth
      value={user?.id ?? ''}
      readOnly={isReadOnly}
      onChange={(e) =>
        onChange(users.find((u) => u.id === e.target.value) ?? null)
      }
    >
      {users.map((u) => (
        <MenuItem key={u.id} value={u.id}>
          {u.name}
        </MenuItem>
      ))}
    </Select>
  )
}

export default forwardRef(UserField)
