'use client'
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Modal,
  Stack,
  Typography,
} from '@mui/material'
import { Resource, Schema, File } from '@supplyside/model'
import { Close } from '@mui/icons-material'
import ResourceForm from './ResourceForm'
import { getPreviewPath } from '@/app/api/download/[filename]/util'

type Props = {
  resource: Resource
  schema: Schema
  file: File | undefined
  isOpen: boolean
  onClose: (path: string) => void
}

export function CompareModalView({
  resource,
  schema,
  onClose,
  isOpen,
  file,
}: Props) {
  return (
    <Modal
      open={isOpen}
      onClose={() => onClose(window.location.pathname)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Card sx={{ width: '100%', height: '100%' }}>
        <CardContent sx={{ height: '100%' }}>
          <Stack spacing={2} height="100%">
            <Stack direction="row">
              <Typography variant="h4" flexGrow={1}>
                Compare
              </Typography>
              <IconButton onClick={() => onClose(window.location.pathname)}>
                <Close />
              </IconButton>
            </Stack>
            <Stack
              spacing={2}
              direction="row"
              flexGrow={1}
              height="100%"
              overflow="auto"
            >
              <Box height="100%" overflow="auto">
                <ResourceForm
                  schema={schema}
                  resource={resource}
                  singleColumn
                />
              </Box>
              <iframe
                src={getPreviewPath(file)}
                style={{ width: '100%', flexGrow: 1 }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Modal>
  )
}
