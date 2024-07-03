'use client'

import { MenuItem, Select } from '@mui/material'
import { useEffect, useState } from 'react'
import { Option } from '@/domain/schema/types'
import { readUsers } from '@/lib/schema/field-meta'

type Props = {
  inputId: string
  userId: string | undefined
  onChange: (userId: string) => void
}

export default function UserField({ userId, inputId, onChange }: Props) {
  const [users, setUsers] = useState<Option[]>([])

  useEffect(() => {
    readUsers().then(setUsers)
  }, [])

  return (
    <Select
      id={inputId}
      fullWidth
      defaultValue={userId}
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
