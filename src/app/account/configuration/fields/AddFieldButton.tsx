'use client'

import { Button, Card, CardContent, Modal, Typography } from '@mui/material'
import { ReactNode, useState } from 'react'
import { Add } from '@mui/icons-material'
import CreateFieldForm from './CreateFieldForm'
import { CreateFieldParams } from './actions'

type Props = {
  onSubmit: (params: CreateFieldParams) => void
}

export default function AddFieldButton({ onSubmit }: Props): ReactNode {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        endIcon={<Add />}
        variant="contained"
      >
        Add Field
      </Button>
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
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
                onSubmit(params)
                setIsOpen(false)
              }}
            />
          </CardContent>
        </Card>
        {/* </Box> */}
      </Modal>
    </>
  )
}
