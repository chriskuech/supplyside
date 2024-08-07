import { fail } from 'assert'
import { Box, Container, Stack, Typography } from '@mui/material'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import OrderStatusTracker from './OrderStatusTracker'
import ApproveButton from './cta/ApproveButton'
import SkipButton from './cta/SkipButton'
import StatusTransitionButton from './cta/StatusTransitionButton'
import SendPoButton from './cta/SendPoButton'
import Toolbar from './toolbar/Toolbar'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import ResourceTable from '@/lib/resource/ResourceTable'
import { readResource, readResources } from '@/lib/resource/actions'
import { readSchema } from '@/lib/schema/actions'
import {
  fields,
  orderStatusOptions,
} from '@/domain/schema/template/system-fields'
import { readUser } from '@/lib/iam/actions'
import ItemizedCostLines from '@/lib/resource/ItemizedCostLines'
import { selectValue } from '@/domain/resource/types'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import PreviewDraftPoButton from '@/app/orders/[key]/cta/PreviewDraftPoButton'

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

          <Toolbar resourceId={resource.id} schema={schema} isDraft={isDraft} />
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
            resourceId={resource.id}
            isReadOnly={!isDraft}
          />
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
            <ResourceTable
              schema={lineSchema}
              resources={lineResources}
              isEditable
            />
            <Stack direction={'row'} justifyContent={'end'}>
              <Box width={'60%'}>
                <ItemizedCostLines resource={resource} />
              </Box>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Stack>
  )
}
