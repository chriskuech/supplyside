'use client'

import { Box, Drawer, Typography } from '@mui/material'
import { Resource, Schema } from '@supplyside/model'
import ResourceForm from './ResourceForm'

type ResourceFieldDrawerProps = {
  state: { schema: Schema; resource: Resource } | undefined
  onClose: (path: string) => void
}

export const ResourceDrawerView = ({
  state,
  onClose,
}: ResourceFieldDrawerProps) => (
  <Drawer
    open={!!state}
    onClose={() => onClose(window.location.pathname)}
    anchor="right"
  >
    {state && (
      <Box p={2} minWidth={500}>
        <Typography variant="h5" sx={{ p: 2 }} gutterBottom>
          {state.schema.resourceType} details
        </Typography>
        <ResourceForm
          resource={state.resource}
          schema={state.schema}
          singleColumn
        />
      </Box>
    )}
  </Drawer>
)
