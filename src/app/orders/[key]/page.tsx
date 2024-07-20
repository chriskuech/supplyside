import { Box, Container, Stack, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import ResourceTable from '@/lib/resource/ResourceTable'
import { readResource, readResources } from '@/lib/resource/actions'
import { readSchema } from '@/lib/schema/actions'
import {
  fields,
  orderStatusOptions,
} from '@/domain/schema/template/system-fields'
import OrderStatusTracker from '@/lib/order/OrderStatusTracker'
import { readUser } from '@/lib/iam/actions'
import ApproveButton from '@/lib/order/ApproveButton'

const AssigneeControl = dynamic(() => import('@/lib/order/AssigneeControl'), {
  ssr: false,
})

const CancelButton = dynamic(() => import('@/lib/order/CancelButton'), {
  ssr: false,
})

const CreateResourceButton = dynamic(
  () => import('@/lib/resource/CreateResourceButton'),
  { ssr: false },
)

const PreviewPoButton = dynamic(() => import('@/lib/order/PreviewPoButton'), {
  ssr: false,
})

const EditButton = dynamic(() => import('@/lib/order/EditButton'), {
  ssr: false,
})

const SkipButton = dynamic(() => import('@/lib/order/SkipButton'), {
  ssr: false,
})

const StatusTransitionButton = dynamic(
  () => import('@/lib/order/StatusTransitionButton'),
  {
    ssr: false,
  },
)

const SendPoButton = dynamic(() => import('@/lib/order/SendPoButton'), {
  ssr: false,
})

export default async function OrderDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  await requireSessionWithRedirect()

  const [user, schema, resource] = await Promise.all([
    readUser(),
    readSchema({ resourceType: 'Order' }),
    readResource({ type: 'Order', key: Number(key) }),
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

  const isDraft = status?.templateId === orderStatusOptions.draft.templateId

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
        <Stack direction={'row'} alignItems={'center'} spacing={1}>
          <Typography variant="h3">
            <span style={{ fontWeight: 100 }}>Order #</span>
            <span style={{ fontWeight: 700 }}>{key}</span>
          </Typography>

          <Box flexGrow={1} />

          {!isDraft && (
            <Box height={'min-content'}>
              <EditButton resourceId={resource.id} />
            </Box>
          )}
          <Box height={'min-content'}>
            <AssigneeControl schema={schema} resource={resource} />
          </Box>
          <Box height={'min-content'}>
            <CancelButton resourceId={resource.id} />
          </Box>
        </Stack>
      </Container>

      <Stack direction={'row'} height={100}>
        <Box
          flexGrow={1}
          height={70}
          my={'15px'}
          sx={{
            background: `linear-gradient(90deg, ${statusColorStart} 0%, ${statusColorEnd} 100%)`,
          }}
        />
        <Container sx={{ flexShrink: 0 }} disableGutters>
          <Stack
            direction={'row'}
            sx={{ overflowX: 'hidden', height: 100 }}
            alignItems={'center'}
          >
            <Box sx={{ borderRadius: 10, flexGrow: 1 }}>
              <OrderStatusTracker
                resource={resource}
                schema={schema}
                fieldTemplateId={fields.orderStatus.templateId}
              />
            </Box>
            <Stack
              width={400}
              flexShrink={0}
              direction={'row'}
              justifyContent={'end'}
              alignItems={'center'}
              spacing={2}
              mr={3}
            >
              {isDraft && (
                <>
                  <PreviewPoButton resourceId={resource.id} />
                  <StatusTransitionButton
                    resourceId={resource.id}
                    statusOption={orderStatusOptions.submitted}
                    label={'Submit'}
                  />
                </>
              )}
              {status?.templateId ===
                orderStatusOptions.submitted.templateId && (
                <>
                  <PreviewPoButton resourceId={resource.id} />
                  <ApproveButton
                    resourceId={resource.id}
                    isDisabled={user.isApprover}
                  />
                </>
              )}
              {status?.templateId ===
                orderStatusOptions.approved.templateId && (
                <>
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
          </Stack>
        </Container>
        <Box flexGrow={1} bgcolor={'transparent'} />
      </Stack>

      <Container sx={{ py: 5 }}>
        <Stack spacing={5}>
          <ResourceFieldsControl resource={resource} isReadOnly={!isDraft} />
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
