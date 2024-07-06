import { Box, Button, Container, Stack, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import { ArrowLeft } from '@mui/icons-material'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import ResourceTable from '@/lib/resource/ResourceTable'
import { readResource, readResources } from '@/lib/resource/actions'
import { readSchema } from '@/lib/schema/actions'
import { createPo } from '@/lib/order/actions'
import ResourceFieldControl from '@/lib/resource/ResourceFieldControl'
import { fields } from '@/domain/schema/template/system-template'
import OrderStatusTracker from '@/lib/order/OrderStatusTracker'

const CreateResourceButton = dynamic(
  () => import('@/lib/resource/CreateResourceButton'),
  { ssr: false },
)

const CreatePoButton = dynamic(() => import('@/lib/order/CreatePoButton'), {
  ssr: false,
})

const SendPoButton = dynamic(() => import('@/lib/order/SendPoButton'), {
  ssr: false,
})

const description = (status: string) =>
  match(status)
    .with(
      'Draft',
      () =>
        'Add the header and line information to the Order and click the submit button when the Order is ready for approval.',
    )
    .with('Submitted', () => 'This Order is pending approval.')
    .with(
      'Approved',
      () =>
        'The Order has been approved and is waiting to be sent to the Vendor.',
    )
    .with(
      'Ordered',
      () =>
        'The order has been placed with the Vendor and is waiting for fulfillment.',
    )
    .with('Received', () => 'The order has been received.')
    .with('Canceled', () => 'The order has been canceled.')
    .otherwise(() => 'Status not found')

export default async function OrderDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  await requireSessionWithRedirect()

  const [schema, resource] = await Promise.all([
    readSchema({
      resourceType: 'Order',
    }),
    readResource({
      type: 'Order',
      key: Number(key),
    }),
  ])

  const [lineSchema, lineResources] = await Promise.all([
    readSchema({
      resourceType: 'Line',
    }),
    readResources({
      type: 'Line',
      where: {
        '==': [{ var: 'Order' }, resource.id],
      },
    }),
  ])

  const status = resource.fields.find(
    (f) => f.templateId === fields.orderStatus.templateId,
  )?.value.option?.name

  const statusColorStart = match(status)
    .with('Draft', () => yellow[600])
    .with('Received', () => green[900])
    .with('Canceled', () => red[900])
    .otherwise(() => yellow[900])

  const statusColorEnd = match(status)
    .with('Draft', () => yellow[500])
    .with('Received', () => green[800])
    .with('Canceled', () => red[800])
    .otherwise(() => yellow[800])

  return (
    <Stack>
      <Container sx={{ py: 5 }}>
        <Stack
          direction={'row'}
          justifyContent={'space-between'}
          alignItems={'start'}
        >
          <Typography variant="h3">
            <span style={{ fontWeight: 100 }}>Order #</span>
            <span style={{ fontWeight: 700 }}>{key}</span>
          </Typography>
          <Stack spacing={2}>
            <Stack direction={'row'} spacing={2}>
              <Stack width={375}>
                <Typography variant="overline">Vendor</Typography>
                <ResourceFieldControl
                  resource={resource}
                  fieldTemplateId={fields.vendor.templateId}
                />
              </Stack>
              <Stack width={250}>
                <Typography variant="overline">Assignee</Typography>
                <ResourceFieldControl
                  resource={resource}
                  fieldTemplateId={fields.assignee.templateId}
                />
              </Stack>
            </Stack>
            <Stack flexGrow={1}>
              <Typography variant="overline">Description</Typography>
              <ResourceFieldControl
                resource={resource}
                fieldTemplateId={fields.description.templateId}
              />
            </Stack>
          </Stack>
        </Stack>
      </Container>

      <Stack sx={{ pt: 5, backgroundColor: 'rgb(65 154 248 / 21%)' }}>
        <Stack direction={'row'} height={100}>
          <Box
            flexGrow={1}
            sx={{
              background: `linear-gradient(90deg, ${statusColorStart} 0%, ${statusColorEnd} 100%)`,
            }}
          />
          <Container sx={{ flexShrink: 0 }} disableGutters>
            <Stack direction={'row'}>
              <Box sx={{ borderRadius: 10 }}>
                <OrderStatusTracker
                  resource={resource}
                  schema={schema}
                  fieldTemplateId={fields.orderStatus.templateId}
                />
              </Box>
              <Stack
                sx={{
                  flexGrow: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box maxWidth={'70%'}>
                  {status ? description(status) : undefined}
                </Box>
              </Stack>
            </Stack>
          </Container>
          <Box flexGrow={1} bgcolor={'transparent'} />
        </Stack>
        <Container>
          <Stack
            direction={'row'}
            justifyContent={'center'}
            alignItems={'center'}
            spacing={2}
            p={7}
          >
            <Button
              sx={{ fontSize: '1.2em', boxShadow: 'none' }}
              startIcon={<ArrowLeft />}
              variant={'text'}
            >
              Edit
            </Button>
            <SendPoButton resourceId={resource.id} />
            <CreatePoButton resourceId={resource.id} onClick={createPo} />
            <Box>
              <ResourceFieldControl
                resource={resource}
                fieldTemplateId={fields.orderStatus.templateId}
              />
            </Box>
          </Stack>
        </Container>
      </Stack>

      <Container sx={{ py: 5 }}>
        <Stack spacing={5}>
          <ResourceFieldsControl resource={resource} />
          <Stack spacing={2}>
            <Stack direction={'row'} alignItems={'end'}>
              <Typography variant="h4" flexGrow={1}>
                Lines
              </Typography>
              <CreateResourceButton
                type={'Line'}
                data={{
                  Order: resource.id,
                }}
              />
            </Stack>
            <ResourceTable schema={lineSchema} resources={lineResources} />
          </Stack>
        </Stack>
      </Container>
    </Stack>
  )
}
