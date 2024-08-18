'use server'

import { Box, Container, Stack, Typography } from '@mui/material'
import { ResourceType } from '@prisma/client'
import CreateResourceButton from './CreateResourceButton'
import ResourceTable from './grid/ResourceTable'
import { readResources } from '@/domain/resource/actions'
import { readSchema } from '@/domain/schema/actions'
import { requireSessionWithRedirect } from '@/lib/session/actions'

type Props = {
  tableKey: string
  resourceType: ResourceType
}

export default async function ListPage({ tableKey, resourceType }: Props) {
  const { accountId } = await requireSessionWithRedirect()
  const [schema, resources] = await Promise.all([
    readSchema({ accountId, resourceType }),
    readResources({ accountId, type: resourceType }),
  ])

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={4}>
        <Stack direction="row" alignItems={'center'}>
          <Typography
            variant="h3"
            flexGrow={1}
            sx={{ textShadow: '0px 7px 27px rgba(0, 0, 0, 0.3)' }}
          >
            {resourceType}s
          </Typography>
          <Box>
            <CreateResourceButton
              type={resourceType}
              shouldRedirect
              buttonProps={{
                size: 'large',
                color: 'secondary',
              }}
            />
          </Box>
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
