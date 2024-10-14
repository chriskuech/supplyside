import { Alert, Box, Container, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { ResourceType } from '@supplyside/model'
import { z } from 'zod'
import { GridFilterModel } from '@mui/x-data-grid'
import CreateResourceButton from './CreateResourceButton'
import { ResourceDrawer } from './ResourceDrawer'
import { ListPageResourceTable } from './ListPageResourceTable'
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

  const initialGridFilterModel = z
    .string()
    .transform(
      (data) => JSON.parse(decodeURIComponent(data)) as GridFilterModel,
    )
    .optional()
    .safeParse(searchParams.filter).data

  if (!schema || !resources)
    return (
      <Alert severity="error">
        Failed to load {resourceType}s. Please try again.
      </Alert>
    )

  return (
    <>
      {/* the container also has `px: 2`, which can't be overridden normally */}
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Stack spacing={4}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="h4" flexGrow={1}>
              {resourceType.replace(/([a-z])([A-Z])/g, '$1 $2')}s
            </Typography>
            {[
              ...callToActions,
              ...(!['JobLine', 'PurchaseLine'].includes(resourceType)
                ? [
                    <CreateResourceButton
                      key={CreateResourceButton.name}
                      resourceType={resourceType}
                      buttonProps={{
                        size: 'large',
                        color: 'secondary',
                      }}
                    />,
                  ]
                : []),
            ].map((cta, i) => (
              <Box key={i} height="min-content">
                {cta}
              </Box>
            ))}
          </Stack>
          <ListPageResourceTable
            tableKey={tableKey}
            schema={schema}
            resources={resources}
            initialGridFilterModel={initialGridFilterModel}
          />
        </Stack>
      </Container>
      <ResourceDrawer searchParams={searchParams} />
    </>
  )
}
