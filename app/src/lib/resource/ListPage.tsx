import { Alert, Box, Container, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { ResourceType } from '@supplyside/model'
import CreateResourceButton from './CreateResourceButton'
import { ResourceTable } from './table'
import { ResourceDrawer } from './ResourceDrawer'
import { requireSession } from '@/session'
import { readSchema } from '@/client/schema'
import { readResources } from '@/client/resource'

type Props = {
  tableKey: string
  resourceType: ResourceType
  callToActions?: ReactNode[]
  searchParams: Record<string, unknown>
}

export default async function ListPage({
  tableKey,
  resourceType,
  searchParams,
  callToActions = [],
}: Props) {
  const { accountId } = await requireSession()
  const [schema, resources] = await Promise.all([
    readSchema(accountId, resourceType),
    readResources(accountId, resourceType),
  ])

  if (!schema || !resources)
    return (
      <Alert severity="error">
        Failed to load {resourceType}s. Please try again.
      </Alert>
    )

  return (
    <>
      <ResourceDrawer searchParams={searchParams} />
      <Container sx={{ my: 5 }}>
        <Stack spacing={4}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography
              variant="h3"
              flexGrow={1}
              sx={{ textShadow: '0px 7px 27px rgba(0, 0, 0, 0.3)' }}
            >
              {resourceType}s
            </Typography>
            {[
              ...callToActions,
              <CreateResourceButton
                key={CreateResourceButton.name}
                resourceType={resourceType}
                shouldRedirect
                buttonProps={{
                  size: 'large',
                  color: 'secondary',
                }}
              />,
            ].map((cta, i) => (
              <Box key={i} height="min-content">
                {cta}
              </Box>
            ))}
          </Stack>
          <ResourceTable
            tableKey={tableKey}
            schema={schema}
            resources={resources}
          />
        </Stack>
      </Container>
    </>
  )
}
