'use client'

import { Close } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { FC } from 'react'
import { deleteResource } from '@/actions/resource'

export const DeletePartButton: FC<{ partId: string }> = ({ partId }) => (
  <IconButton onClick={() => deleteResource(partId)} size="small">
    <Close fontSize="small" />
  </IconButton>
)
