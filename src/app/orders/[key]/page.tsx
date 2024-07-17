import { Box, Container, Stack, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import ResourceTable from '@/lib/resource/ResourceTable'
import { readResource, readResources } from '@/lib/resource/actions'
import { readSchema } from '@/lib/schema/actions'
import ResourceFieldControl from '@/lib/resource/ResourceFieldControl'
import {
  fields,
  orderStatusOptions,
} from '@/domain/schema/template/system-fields'
import OrderStatusTracker from '@/lib/order/OrderStatusTracker'
import { readUser } from '@/lib/iam/actions'

const CreateResourceButton = dynamic(
  () => import('@/lib/resource/CreateResourceButton'),
  { ssr: false },
)

const EditButton = dynamic(() => import('@/lib/order/EditButton'), {
  ssr: false,
})

const SkipButton = dynamic(() => import('@/lib/order/SkipButton'), {
  ssr: false,
})

const CancelButton = dynamic(() => import('@/lib/order/CancelButton'), {
  ssr: false,
})

const StatusTransitionButton = dynamic(
  () => import('@/lib/order/StatusTransitionButton'),
  {
    ssr: false,
  },
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

  const [user, schema, resource] = await Promise.all([
    readUser(),
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
  )?.value.option

  const statusColorStart = match(status?.templateId)
    .with(orderStatusOptions.draft.templateId, () => yellow[600])
    .with(orderStatusOptions.received.templateId, () => green[900])
    .with(orderStatusOptions.canceled.templateId, () => red[900])
    .otherwise(() => yellow[900])

  const statusColorEnd = match(status?.templateId)
    .with(orderStatusOptions.draft.templateId, () => yellow[500])
    .with(orderStatusOptions.received.templateId, () => green[800])
    .with(orderStatusOptions.canceled.templateId, () => red[800])
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
          <Stack direction={'row'} spacing={2} height={'min-content'}>
            <Stack width={250}>
              <Typography variant="overline">Assignee</Typography>
              <ResourceFieldControl
                resource={resource}
                fieldTemplateId={fields.assignee.templateId}
              />
            </Stack>

            {status?.templateId !== orderStatusOptions.draft.templateId && (
              <Box height={'min-content'}>
                <EditButton resourceId={resource.id} />
              </Box>
            )}
            <Box height={'min-content'}>
              <CancelButton resourceId={resource.id} />
            </Box>
          </Stack>
        </Stack>
        <Stack
          direction={'row'}
          justifyContent={'space-between'}
          alignItems={'start'}
          spacing={2}
        >
          <Stack width={375}>
            <Typography variant="overline">Vendor</Typography>
            <ResourceFieldControl
              resource={resource}
              fieldTemplateId={fields.vendor.templateId}
            />
          </Stack>
          <Stack flexGrow={1}>
            <Typography variant="overline">Description</Typography>
            <ResourceFieldControl
              resource={resource}
              fieldTemplateId={fields.description.templateId}
            />
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
                <Box maxWidth={'70%'} sx={{ opacity: 0.7, fontSize: '0.9em' }}>
                  {status ? description(status.name) : undefined}
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
            {status?.templateId === orderStatusOptions.draft.templateId && (
              <StatusTransitionButton
                resourceId={resource.id}
                statusOption={orderStatusOptions.submitted}
                label={'Submit'}
              />
            )}
            {status?.templateId === orderStatusOptions.submitted.templateId && (
              <StatusTransitionButton
                resourceId={resource.id}
                statusOption={orderStatusOptions.approved}
                label={'Approve'}
                isDisabled={user.isApprover}
              />
            )}
            {status?.templateId === orderStatusOptions.approved.templateId && (
              <>
                <CreatePoButton resourceId={resource.id} />
                <SendPoButton resourceId={resource.id} />
                <SkipButton resourceId={resource.id} />
              </>
            )}
            {status?.templateId === orderStatusOptions.ordered.templateId && (
              <StatusTransitionButton
                resourceId={resource.id}
                statusOption={orderStatusOptions.received}
                label={'Confirm Receipt'}
              />
            )}
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
                data={{ Order: resource.id }}
              />
            </Stack>
            <ResourceTable schema={lineSchema} resources={lineResources} />
          </Stack>
        </Stack>
      </Container>
    </Stack>
  )
}
