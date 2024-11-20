'use client'

import { Drawer, Stack, Typography } from '@mui/material'
import { Resource, SchemaData } from '@supplyside/model'
import { ReactNode } from 'react'
import ResourceForm from './ResourceForm'
import DeleteResourceButton from './DeleteResourceButton'

type ResourceFieldDrawerProps = {
  state: { schema: SchemaData; resource: Resource } | undefined
  tools: readonly ReactNode[]
  onClose: (path: string) => void
  children?: ReactNode
}

export const ResourceDrawerView = ({
  state,
  tools,
  onClose,
  children,
}: ResourceFieldDrawerProps) => (
  <Drawer
    open={!!state}
    onClose={() => onClose(window.location.pathname)}
    anchor="right"
  >
    {state && (
      <Stack p={2} width={500} spacing={4}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h5" flexGrow={1}>
            {state.schema.resourceType.replace(/([a-z])([A-Z])/g, '$1 $2')}{' '}
            details
          </Typography>
          {tools}
          <DeleteResourceButton
            resourceType={state.schema.resourceType}
            resourceId={state.resource.id}
            size="small"
          />
        </Stack>
        <ResourceForm
          resource={state.resource}
          schemaData={state.schema}
          singleColumn
        />
        {children}
      </Stack>
    )}
  </Drawer>
)
