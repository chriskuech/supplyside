import { Container, Stack, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import ResourceTable from '@/lib/resource/ResourceTable'
import { readSchema } from '@/domain/schema/actions'
import {
  createResource,
  readResource,
  readResources,
} from '@/domain/resource/actions'
import { createPo } from '@/domain/order/createPo'

const CreateResourceButton = dynamic(
  () => import('@/lib/resource/CreateResourceButton'),
  { ssr: false },
)

const CreatePoButton = dynamic(() => import('@/lib/order/CreatePoButton'), {
  ssr: false,
})

export default async function OrderDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  await requireSessionWithRedirect()

  const { id } = await readResource({ type: 'Order', key: Number(key) })

  const [lineSchema, lineResources] = await Promise.all([
    readSchema({
      resourceType: 'Line',
    }),
    readResources({
      type: 'Line',
      where: {
        '==': [{ var: 'Order' }, id],
      },
    }),
  ])

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Stack direction={'row'} justifyContent={'space-between'}>
            <Typography variant="h3">
              <span style={{ fontWeight: 100 }}>Order #</span>
              <span style={{ fontWeight: 700 }}>{key}</span>
            </Typography>
            <CreatePoButton resourceId={id} onClick={createPo} />
          </Stack>
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
              data={{
                Order: id,
              }}
            />
          </Stack>
          <ResourceTable schema={lineSchema} resources={lineResources} />
        </Stack>
      </Stack>
    </Container>
  )
}
