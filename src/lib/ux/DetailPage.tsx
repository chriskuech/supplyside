'use server'

import { Container, Stack, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource-fields/ResourceFieldsControl'
import ResourceTable from '@/lib/resource/ResourceTable'
import { readSchema } from '@/lib/schema/actions'
import { createResource, readResources } from '@/lib/resource/actions'

const CreateResourceButton = dynamic(
  () => import('@/lib/resource/CreateResourceButton'),
  { ssr: false },
)

export default async function DetailPage({
  params: { key },
}: {
  params: { key: string }
}) {
  await requireSessionWithRedirect()

  const [schema, resources] = await Promise.all([
    readSchema({
      resourceType: 'Line',
    }),
    readResources({
      type: 'Line',
    }),
  ])

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Typography variant="h3">
            <span style={{ fontWeight: 100 }}>Order #</span>
            <span style={{ fontWeight: 700 }}>{key}</span>
          </Typography>
          <ResourceFieldsControl
            resourceType={'Order'}
            resourceKey={Number(key)}
          />
        </Stack>
        <Stack spacing={2}>
          <Stack direction={'row'} alignItems={'end'}>
            <Typography variant="h4" flexGrow={1}>
              Lines
            </Typography>
            <CreateResourceButton
              type={'Line'}
              createResource={createResource}
            />
          </Stack>
          <ResourceTable schema={schema} resources={resources} />
        </Stack>
      </Stack>
    </Container>
  )
}
