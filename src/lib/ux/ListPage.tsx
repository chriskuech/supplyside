'use server'

import { Container, Stack, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { ResourceType } from '@prisma/client'
import { requireSessionWithRedirect } from '@/lib/session'
import { createResource, readResources } from '@/lib/resource/actions'
import { readSchema } from '@/lib/schema/actions'

const ResourceTable = dynamic(() => import('@/lib/resource/ResourceTable'), {
  ssr: false,
})

const CreateResourceButton = dynamic(
  () => import('@/lib/resource/CreateResourceButton'),
  { ssr: false },
)

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
        <Stack direction="row">
          <Typography variant="h3" flexGrow={1}>
            {resourceType}s
          </Typography>
          <CreateResourceButton
            type={resourceType}
            createResource={createResource}
            shouldRedirect
          />
        </Stack>
        <ResourceTable schema={schema} resources={resources} />
      </Stack>
    </Container>
  )
}
