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
  cancelButtonText?: string
  confirmButtonText?: string
  onConfirm: () => void
  onClose: () => void
}

//TODO: refactor for using with a useConfirmation hook
export default function ConfirmationDialog({
  isOpen,
  content,
  title,
  onClose,
  onConfirm,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
}: Props) {
  const handleConfirm = () => {
    onClose()
    onConfirm()
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
