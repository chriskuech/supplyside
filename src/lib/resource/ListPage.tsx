'use server'

import { Box, Container, Stack, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { ResourceType } from '@prisma/client'
import { requireSessionWithRedirect } from '@/lib/session'
import { readSchema } from '@/domain/schema/actions'
import { createResource, readResources } from '@/domain/resource/actions'

const ResourceTable = dynamic(() => import('./ResourceTable'), {
  ssr: false,
})

const CreateResourceButton = dynamic(() => import('./CreateResourceButton'), {
  ssr: false,
})

type Props = {
  resourceType: ResourceType
}

export default async function ListPage({ resourceType }: Props) {
  await requireSessionWithRedirect()

  const [schema, resources] = await Promise.all([
    readSchema({ resourceType }),
    readResources({ type: resourceType }),
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
              createResource={createResource}
              shouldRedirect
              buttonProps={{
                size: 'large',
                color: 'secondary',
              }}
            />
          </Box>
        </Stack>
        <ResourceTable
          schema={schema}
          resources={resources}
          iseditable={false}
        />
      </Stack>
    </Container>
  )
}
