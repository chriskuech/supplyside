'use client'

import { Button, Card, CardContent, Modal, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { Add } from '@mui/icons-material'
import CreateFieldForm from './CreateFieldForm'
import { useDisclosure } from '@/lib/hooks/useDisclosure'
import { createField } from '@/domain/schema/fields/actions'

export default function AddFieldButton(): ReactNode {
  const { isOpen, close, open } = useDisclosure()

  return (
    <>
      <Button onClick={open} endIcon={<Add />}>
        Add Field
      </Button>
      <Modal
        open={isOpen}
        onClose={close}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Card sx={{ width: 'fit-content', height: 'fit-content' }}>
          <CardContent>
            <Typography gutterBottom variant="h6" flexGrow={1}>
              Create Field
            </Typography>
            <CreateFieldForm
              onSubmit={(params) => {
                createField(params)
                close()
              }}
            />
          </CardContent>
        </Card>
        {/* </Box> */}
      </Modal>
    </>
  )
}
