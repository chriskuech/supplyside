'use client'

import React, { ReactNode } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'

type Props = {
  isOpen: boolean
  title: string
  content: ReactNode
  confirmButtonText?: string
  cancelButtonText?: string
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmationDialog({
  isOpen,
  title,
  content,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  onConfirm,
  onClose,
}: Props) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onClose}>
          {cancelButtonText}
        </Button>
        <Button onClick={handleConfirm}>{confirmButtonText}</Button>
      </DialogActions>
    </Dialog>
  )
}
