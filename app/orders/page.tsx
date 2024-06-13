import { Container, Stack, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { requireSessionWithRedirect } from '@/lib/auth'
import { createResource, readResources } from '@/lib/resource/actions'
import { readSchema } from '@/lib/schema/actions'

const ResourceTable = dynamic(() => import('@/lib/resource/ResourceTable'), {
  ssr: false,
})
const CreateResourceButton = dynamic(
  () => import('@/lib/resource/CreateResourceButton'),
  { ssr: false },
)

export default async function Orders() {
  await requireSessionWithRedirect()

  const [schema, resources] = await Promise.all([
    readSchema({ resourceType: 'Order' }),
    readResources({ type: 'Order' }),
  ])

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={4}>
        <Stack direction="row">
          <Typography variant="h4" flexGrow={1}>
            Orders
          </Typography>
          <CreateResourceButton
            type="Order"
            createResource={createResource}
            shouldRedirect
          />
        </Stack>
        <ResourceTable schema={schema} resources={resources} />
      </Stack>
    </Container>
  )
}
