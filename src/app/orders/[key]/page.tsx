import { fail } from 'assert'
import { Box, Container, Stack, Typography } from '@mui/material'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import OrderStatusTracker from './OrderStatusTracker'
import ApproveButton from './cta/ApproveButton'
import SkipButton from './cta/SkipButton'
import StatusTransitionButton from './cta/StatusTransitionButton'
import SendPoButton from './cta/SendPoButton'
import { findOrderBills } from './actions'
import TrackingControl from './tools/TrackingControl'
import CancelOrderControl from './tools/CancelOrderControl'
import EditControl from './tools/EditControl'
import BillLink from './tools/BillLink'
import PreviewPoControl from './tools/PreviewPoControl'
import DownloadPoControl from './tools/DownloadPoControl'
import {
  fields,
  orderStatusOptions,
} from '@/domain/schema/template/system-fields'
import { selectResourceField } from '@/domain/resource/extensions'
import { emptyValue } from '@/domain/resource/entity'
import PreviewDraftPoButton from '@/app/orders/[key]/cta/PreviewDraftPoButton'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import { isMissingRequiredFields } from '@/domain/resource/mappers'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'
import { selectSchemaField } from '@/domain/schema/types'
import AssigneeToolbarControl from '@/lib/resource/detail/AssigneeToolbarControl'
import AttachmentsToolbarControl from '@/lib/resource/detail/AttachmentsToolbarControl'

export default async function OrderDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const {
    session: { user },
    resource,
    schema,
  } = await readDetailPageModel('Order', key, `/orders/${key}`)

  const orderBills = (await findOrderBills(resource.id)) ?? []

  const status =
    selectResourceField(resource, fields.orderStatus)?.option ??
    fail('Status not found')

  const isDraft = status.templateId === orderStatusOptions.draft.templateId

  const statusColorStart = match(status.templateId)
    .with(orderStatusOptions.draft.templateId, () => yellow[600])
    .with(orderStatusOptions.received.templateId, () => green[900])
    .with(orderStatusOptions.canceled.templateId, () => red[900])
    .otherwise(() => yellow[900])

  const statusColorEnd = match(status.templateId)
    .with(orderStatusOptions.draft.templateId, () => yellow[500])
    .with(orderStatusOptions.received.templateId, () => green[800])
    .with(orderStatusOptions.canceled.templateId, () => red[800])
    .otherwise(() => yellow[800])

  const hasInvalidFields = isMissingRequiredFields(schema, resource)
  const poFile = selectResourceField(resource, fields.document)?.file

  return (
    <ResourceDetailPage
      schema={schema}
      resource={resource}
      tools={[
        ...orderBills.map((bill) => <BillLink key={bill.id} bill={bill} />),
        <TrackingControl
          key={TrackingControl.name}
          resourceId={resource.id}
          field={
            selectSchemaField(schema, fields.trackingNumber) ??
            fail('Field not found')
          }
          value={
            selectResourceField(resource, fields.trackingNumber) ?? emptyValue
          }
        />,
        ...(poFile ? [<PreviewPoControl key={poFile.id} file={poFile} />] : []),
        ...(poFile
          ? [<DownloadPoControl key={poFile.id} file={poFile} />]
          : []),
        <AttachmentsToolbarControl
          key={AttachmentsToolbarControl.name}
          resourceId={resource.id}
          resourceType="Order"
          field={
            selectSchemaField(schema, fields.orderAttachments) ??
            fail('Field not found')
          }
          value={selectResourceField(resource, fields.orderAttachments)}
        />,
        <AssigneeToolbarControl
          key={AssigneeToolbarControl.name}
          resourceId={resource.id}
          resourceType="Order"
          field={
            selectSchemaField(schema, fields.assignee) ??
            fail('Field not found')
          }
          value={selectResourceField(resource, fields.assignee) ?? emptyValue}
        />,
        ...(!isDraft
          ? [<EditControl key={EditControl.name} resourceId={resource.id} />]
          : []),
        <CancelOrderControl
          key={CancelOrderControl.name}
          resourceId={resource.id}
        />,
      ]}
      backlinkField={fields.order}
      isReadOnly={!isDraft}
      actions={
        <Stack direction="row" height={100}>
          <Box
            flexGrow={1}
            height={70}
            my="15px"
            sx={{
              background: `linear-gradient(90deg, ${statusColorStart} 0%, ${statusColorEnd} 100%)`,
            }}
          />
          <Container sx={{ flexShrink: 0 }} disableGutters>
            <Stack
              direction="row"
              sx={{ overflowX: 'hidden', height: 100 }}
              alignItems="center"
            >
              <Box sx={{ borderRadius: 10, flexGrow: 1 }}>
                <OrderStatusTracker resource={resource} />
              </Box>
              <Stack
                width={400}
                flexShrink={0}
                direction="row"
                justifyContent="end"
                alignItems="center"
                spacing={2}
                mr={3}
              >
                {isDraft && (
                  <>
                    <PreviewDraftPoButton resourceId={resource.id} />
                    <StatusTransitionButton
                      isDisabled={hasInvalidFields}
                      tooltip={
                        hasInvalidFields
                          ? 'Please fill in all required fields before submitting'
                          : undefined
                      }
                      resourceId={resource.id}
                      statusOption={orderStatusOptions.submitted}
                      label="Submit"
                    />
                  </>
                )}
                {status.templateId ===
                  orderStatusOptions.submitted.templateId && (
                  <>
                    <PreviewDraftPoButton resourceId={resource.id} />
                    <ApproveButton
                      resourceId={resource.id}
                      isDisabled={!user.isApprover}
                    />
                  </>
                )}
                {status.templateId ===
                  orderStatusOptions.approved.templateId && (
                  <>
                    <SendPoButton resourceId={resource.id} />
                    <SkipButton resourceId={resource.id} />
                  </>
                )}
                {status.templateId ===
                  orderStatusOptions.ordered.templateId && (
                  <StatusTransitionButton
                    resourceId={resource.id}
                    statusOption={orderStatusOptions.received}
                    label="Confirm Receipt"
                  />
                )}
                {(status.templateId ===
                  orderStatusOptions.received.templateId ||
                  status.templateId ===
                    orderStatusOptions.canceled.templateId) && (
                  <Typography sx={{ opacity: 0.5 }}>
                    No further action required
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Container>
          <Box flexGrow={1} bgcolor="transparent" />
        </Stack>
      }
    />
  )
}
