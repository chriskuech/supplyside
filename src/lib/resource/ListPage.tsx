import { Box, Container, Stack, Typography } from '@mui/material'
import { ResourceType } from '@prisma/client'
import { ReactNode } from 'react'
import CreateResourceButton from './CreateResourceButton'
import { ResourceTable } from './table'
import { readResources } from '@/domain/resource'
import { readSchema } from '@/domain/schema'
import { requireSessionWithRedirect } from '@/lib/session/actions'
import '@/server-only'

type Props = {
  tableKey: string
  resourceType: ResourceType
  callToActions?: ReactNode[]
  path: string
}

export default async function ListPage({
  tableKey,
  resourceType,
  path,
  callToActions = [],
}: Props) {
  const { accountId } = await requireSessionWithRedirect(path)
  const [schema, resources] = await Promise.all([
    readSchema({ accountId, resourceType }),
    readResources({ accountId, type: resourceType }),
  ])

  return (
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
              type={resourceType}
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
  )
}
