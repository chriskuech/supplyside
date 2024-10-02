'use client'

import { Drawer, Stack, Typography } from '@mui/material'
import { Resource, Schema } from '@supplyside/model'
import ResourceForm from './ResourceForm'
import DeleteResourceButton from './DeleteResourceButton'

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
      <Stack p={2} minWidth={500}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h5" sx={{ p: 2 }} flexGrow={1}>
            {state.schema.resourceType} details
          </Typography>
          <DeleteResourceButton
            resourceType={state.schema.resourceType}
            resourceId={state.resource.id}
            size="small"
          />
        </Stack>
        <ResourceForm
          resource={state.resource}
          schema={state.schema}
          singleColumn
        />
      </Stack>
    )}
  </Drawer>
)
