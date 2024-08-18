import { fail } from 'assert'
import { Box, Container, Stack, Typography } from '@mui/material'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import OrderStatusTracker from './OrderStatusTracker'
import ApproveButton from './cta/ApproveButton'
import SkipButton from './cta/SkipButton'
import StatusTransitionButton from './cta/StatusTransitionButton'
import SendPoButton from './cta/SendPoButton'
import Toolbar from './Toolbar'
import { findOrderBills } from './actions'
import { requireSessionWithRedirect } from '@/lib/iam/actions'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import { readResource } from '@/lib/resource/actions'
import { readSchema } from '@/lib/schema/actions'
import {
  fields,
  orderStatusOptions,
} from '@/domain/schema/template/system-fields'
import { selectValue } from '@/domain/resource/types'
import PreviewDraftPoButton from '@/app/orders/[key]/cta/PreviewDraftPoButton'
import { readUser } from '@/domain/iam/user/actions'
import LinesAndCosts from '@/lib/resource/grid/LinesAndCosts'

export default async function OrderDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { userId } = await requireSessionWithRedirect()

  const [user, schema, resource] = await Promise.all([
    readUser({ userId }),
    readSchema({ resourceType: 'Order' }),
    readResource({ type: 'Order', key: Number(key) }),
  ])

  const orderBills = await findOrderBills(resource.id)

  const status =
    selectValue(resource, fields.orderStatus)?.option ??
    fail('Status not found')

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
            <span style={{ opacity: 0.5 }}>Order #</span>
            <span>{key}</span>
          </Typography>

          <Box flexGrow={1} />

          <Toolbar
            key={status?.id}
            resource={resource}
            schema={schema}
            isDraft={isDraft}
            bills={orderBills}
          />
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
              <OrderStatusTracker resource={resource} />
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
                  <PreviewDraftPoButton resourceId={resource.id} />
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
                  <PreviewDraftPoButton resourceId={resource.id} />
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
              {(status?.templateId === orderStatusOptions.received.templateId ||
                status?.templateId ===
                  orderStatusOptions.canceled.templateId) && (
                <Typography sx={{ opacity: 0.5 }}>
                  No further action required
                </Typography>
              )}
            </Stack>
          </Stack>
        </Container>
        <Box flexGrow={1} bgcolor={'transparent'} />
      </Stack>

      <Container sx={{ py: 5 }}>
        <Stack spacing={5}>
          <ResourceFieldsControl
            key={status.id}
            schema={schema}
            resource={resource}
            isReadOnly={!isDraft}
          />
          <LinesAndCosts
            resource={resource}
            lineQuery={{
              '==': [{ var: 'Order' }, resource.id],
            }}
            newLineInitialData={{
              [fields.order.name]: resource.id,
            }}
          />
        </Stack>
      </Container>
    </Stack>
  )
}
