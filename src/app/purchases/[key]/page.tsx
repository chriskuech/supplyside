import { fail } from 'assert'
import { Box, Container, Stack, Typography } from '@mui/material'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import PurchaseStatusTracker from './PurchaseStatusTracker'
import ApproveButton from './cta/ApproveButton'
import SkipButton from './cta/SkipButton'
import StatusTransitionButton from './cta/StatusTransitionButton'
import SendPoButton from './cta/SendPoButton'
import { findPurchaseBills } from './actions'
import TrackingControl from './tools/TrackingControl'
import CancelControl from './tools/CancelControl'
import EditControl from './tools/EditControl'
import BillLink from './tools/BillLink'
import PreviewPoControl from './tools/PreviewPoControl'
import DownloadPoControl from './tools/DownloadPoControl'
import {
  fields,
  purchaseStatusOptions,
} from '@/domain/schema/template/system-fields'
import { selectResourceFieldValue } from '@/domain/resource/extensions'
import { emptyValue } from '@/domain/resource/entity'
import PreviewDraftPoButton from '@/app/purchases/[key]/cta/PreviewDraftPoButton'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import { isMissingRequiredFields } from '@/domain/resource/mappers'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'
import { selectSchemaField } from '@/domain/schema/extensions'
import AssigneeToolbarControl from '@/lib/resource/detail/AssigneeToolbarControl'
import AttachmentsToolbarControl from '@/lib/resource/detail/AttachmentsToolbarControl'
import { resources } from '@/domain/schema/template/system-resources'
import { readResources } from '@/domain/resource'
import { createPunchOutServiceRequest } from '@/integrations/mcMasterCarr'

export default async function PurchaseDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const {
    session: { user, accountId },
    resource,
    schema,
    lineSchema,
  } = await readDetailPageModel('Purchase', key, `/purchases/${key}`)

  const vendorTemplateId = selectResourceFieldValue(resource, fields.vendor)
    ?.resource?.templateId
  const isVendorMcMasterCarr =
    vendorTemplateId === resources().mcMasterCarrVendor.templateId
  const purchaseLines = await readResources({
    accountId: resource.accountId,
    type: 'Line',
    where: {
      '==': [{ var: fields.purchase.name }, resource.id],
    },
  })
  const purchaseHasLines = purchaseLines.length > 0
  if (isVendorMcMasterCarr && !purchaseHasLines) {
    let punchoutSessionUrl = selectResourceFieldValue(
      resource,
      fields.punchoutSessionUrl,
    )?.string

    if (!punchoutSessionUrl) {
      punchoutSessionUrl = await createPunchOutServiceRequest(
        accountId,
        resource.id,
      )
    }

    return (
      <iframe
        src={punchoutSessionUrl}
        style={{
          position: 'fixed',
          width: '100%',
          height: '100%',
        }}
      >
        Your browser does not support iFrames.
      </iframe>
    )
  }

  const orderBills = (await findPurchaseBills(resource.id)) ?? []

  const status =
    selectResourceFieldValue(resource, fields.purchaseStatus)?.option ??
    fail('Status not found')

  const isDraft = status.templateId === purchaseStatusOptions.draft.templateId

  const statusColorStart = match(status.templateId)
    .with(purchaseStatusOptions.draft.templateId, () => yellow[600])
    .with(purchaseStatusOptions.received.templateId, () => green[900])
    .with(purchaseStatusOptions.canceled.templateId, () => red[900])
    .otherwise(() => yellow[900])

  const statusColorEnd = match(status.templateId)
    .with(purchaseStatusOptions.draft.templateId, () => yellow[500])
    .with(purchaseStatusOptions.received.templateId, () => green[800])
    .with(purchaseStatusOptions.canceled.templateId, () => red[800])
    .otherwise(() => yellow[800])

  const hasInvalidFields = isMissingRequiredFields(schema, resource)
  const poFile = selectResourceFieldValue(resource, fields.document)?.file

  return (
    <ResourceDetailPage
      lineSchema={lineSchema}
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
            selectResourceFieldValue(resource, fields.trackingNumber) ??
            emptyValue
          }
        />,
        ...(poFile ? [<PreviewPoControl key={poFile.id} file={poFile} />] : []),
        ...(poFile
          ? [<DownloadPoControl key={poFile.id} file={poFile} />]
          : []),
        <AttachmentsToolbarControl
          key={AttachmentsToolbarControl.name}
          resourceId={resource.id}
          resourceType="Purchase"
          field={
            selectSchemaField(schema, fields.purchaseAttachments) ??
            fail('Field not found')
          }
          value={selectResourceFieldValue(resource, fields.purchaseAttachments)}
        />,
        <AssigneeToolbarControl
          key={AssigneeToolbarControl.name}
          resourceId={resource.id}
          resourceType="Purchase"
          field={
            selectSchemaField(schema, fields.assignee) ??
            fail('Field not found')
          }
          value={
            selectResourceFieldValue(resource, fields.assignee) ?? emptyValue
          }
        />,
        ...(!isDraft
          ? [<EditControl key={EditControl.name} resourceId={resource.id} />]
          : []),
        <CancelControl key={CancelControl.name} resourceId={resource.id} />,
      ]}
      backlinkField={fields.purchase}
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
                <PurchaseStatusTracker resource={resource} />
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
                      statusOption={purchaseStatusOptions.submitted}
                      label="Submit"
                    />
                  </>
                )}
                {status.templateId ===
                  purchaseStatusOptions.submitted.templateId && (
                  <>
                    <PreviewDraftPoButton resourceId={resource.id} />
                    <ApproveButton
                      resourceId={resource.id}
                      isDisabled={!user.isApprover && !user.isGlobalAdmin}
                    />
                  </>
                )}
                {status.templateId ===
                  purchaseStatusOptions.approved.templateId && (
                  <>
                    <SendPoButton resourceId={resource.id} />
                    <SkipButton resourceId={resource.id} />
                  </>
                )}
                {status.templateId ===
                  purchaseStatusOptions.purchased.templateId && (
                  <StatusTransitionButton
                    resourceId={resource.id}
                    statusOption={purchaseStatusOptions.received}
                    label="Confirm Receipt"
                  />
                )}
                {(status.templateId ===
                  purchaseStatusOptions.received.templateId ||
                  status.templateId ===
                    purchaseStatusOptions.canceled.templateId) && (
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
