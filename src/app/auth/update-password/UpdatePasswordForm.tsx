'use client'

import { Stack, TextField, Typography } from '@mui/material'
import { FC, FormEvent, useMemo, useState } from 'react'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CheckIcon from '@mui/icons-material/Check'
import { updatePassword as updatePasswordAction } from './actions'
import { testHas6Characters, testHasOneLetter } from './utils'
import { useAsyncCallback } from '@/lib/hooks/useAsyncCallback'
import LoadingButton from '@/lib/ux/LoadingButton'

const UpdatePasswordForm: FC = () => {
  const [password, setPassword] = useState<string>('')
  const [{ isLoading }, updatePassword] = useAsyncCallback(() =>
    updatePasswordAction(password),
  )

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updatePassword()
  }

  const has6Characters = useMemo(() => testHas6Characters(password), [password])
  const hasOneLetter = useMemo(() => testHasOneLetter(password), [password])

  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="row" width={500} gap={1}>
        <TextField
          type="password"
          name="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <LoadingButton
          type="submit"
          disabled={!has6Characters || !hasOneLetter}
          isLoading={isLoading}
        >
          Save
        </LoadingButton>
      </Stack>
      <Stack width={500} mt={1}>
        <Stack direction="row" alignItems="center" gap={1}>
          {hasOneLetter ? (
            <CheckIcon sx={{ fontSize: 15 }} color="success" />
          ) : (
            <InfoOutlinedIcon sx={{ fontSize: 15 }} />
          )}
          <Typography variant="caption">
            Must have at least one letter
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          {has6Characters ? (
            <CheckIcon sx={{ fontSize: 15 }} color="success" />
          ) : (
            <InfoOutlinedIcon sx={{ fontSize: 15 }} />
          )}
          <Typography variant="caption">
            Must be at least 6 characters long
          </Typography>
        </Stack>
      </Stack>
    </form>
  )
}

export default UpdatePasswordForm
