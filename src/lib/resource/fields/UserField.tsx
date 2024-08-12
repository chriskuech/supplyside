'use client'

import { MenuItem, Select } from '@mui/material'
import { ForwardedRef, forwardRef, useEffect, useState } from 'react'
import { Option } from '@/domain/schema/types'
import { readUsers } from '@/lib/schema/field-meta'

type Props = {
  inputId: string
  userId: string | undefined
  onChange: (userId: string) => void
}

function UserField(
  { userId, inputId, onChange }: Props,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const [users, setUsers] = useState<Option[]>([])

  useEffect(() => {
    readUsers().then(setUsers)
  }, [])

  return (
    <Select
      inputRef={ref}
      id={inputId}
      fullWidth
      value={userId ?? ''}
      onChange={(e) => onChange(e.target.value)}
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
