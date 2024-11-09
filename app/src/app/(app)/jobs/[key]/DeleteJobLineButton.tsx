'use client'

import { Close } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { FC } from 'react'
import { deleteResource } from '@/actions/resource'

export const DeleteJobLineButton: FC<{ jobLineId: string }> = ({
  jobLineId,
}) => (
  <IconButton onClick={() => deleteResource(jobLineId)} size="small">
    <Close fontSize="small" />
  </IconButton>
)
