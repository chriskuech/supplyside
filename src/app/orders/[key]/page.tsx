import { Container, Stack, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import ResourceTable from '@/lib/resource/ResourceTable'
import { readResource, readResources } from '@/lib/resource/actions'
import { readSchema } from '@/lib/schema/actions'
import { createPo } from '@/lib/order/actions'
import ResourceFieldControl from '@/lib/resource/ResourceFieldControl'
import { fields } from '@/domain/schema/template/system-template'

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

  const { id: resourceId } = await readResource({
    type: 'Order',
    key: Number(key),
  })

  const [lineSchema, lineResources] = await Promise.all([
    readSchema({
      resourceType: 'Line',
    }),
    readResources({
      type: 'Line',
      where: {
        '==': [{ var: 'Order' }, resourceId],
      },
    }),
  ])

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Stack
            direction={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Typography variant="h3">
              <span style={{ fontWeight: 100 }}>Order #</span>
              <span style={{ fontWeight: 700 }}>{key}</span>
            </Typography>
            <CreatePoButton resourceId={resourceId} onClick={createPo} />
          </Stack>
          <Stack direction={'row'} spacing={2}>
            <Stack width={375}>
              <Typography variant="overline">Vendor</Typography>
              <ResourceFieldControl
                resourceType={'Order'}
                resourceId={resourceId}
                fieldTemplateId={fields.vendor.templateId}
              />
            </Stack>
            <Stack width={250}>
              <Typography variant="overline">Assignee</Typography>
              <ResourceFieldControl
                resourceType={'Order'}
                resourceId={resourceId}
                fieldTemplateId={fields.assignee.templateId}
              />
            </Stack>
            <Stack flexGrow={1}>
              <Typography variant="overline">Description</Typography>
              <ResourceFieldControl
                resourceType={'Order'}
                resourceId={resourceId}
                fieldTemplateId={fields.description.templateId}
              />
            </Stack>
          </Stack>
          <ResourceFieldsControl
            resourceType={'Order'}
            resourceId={resourceId}
          />
        </Stack>
        <Stack spacing={2}>
          <Stack direction={'row'} alignItems={'end'}>
            <Typography variant="h4" flexGrow={1}>
              Lines
            </Typography>
            <CreateResourceButton
              type={'Line'}
              data={{
                Order: resourceId,
              }}
            />
          </Stack>
          <ResourceTable schema={lineSchema} resources={lineResources} />
        </Stack>
      </Stack>
    </Container>
  )
}
