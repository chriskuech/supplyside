import { fail } from 'assert'
import { Typography } from '@mui/material'
import {
  fields,
  isMissingRequiredFields,
  purchaseStatusOptions,
  resources,
  selectResourceFieldValue,
} from '@supplyside/model'
import { isTruthy } from 'remeda'
import ApproveButton from './cta/ApproveButton'
import SkipButton from './cta/SkipButton'
import StatusTransitionButton from './cta/StatusTransitionButton'
import SendPoButton from './cta/SendPoButton'
import TrackingControl from './tools/TrackingControl'
import PreviewPoControl from './tools/PreviewPoControl'
import DownloadPoControl from './tools/DownloadPoControl'
import { PurchaseAttachmentsControl } from './tools/PurchaseAttachmentsControl'
import PreviewDraftPoButton from './cta/PreviewDraftPoButton'
import PunchoutButton from './cta/PunchoutButton'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'
import AssigneeToolbarControl from '@/lib/resource/detail/AssigneeToolbarControl'
import { readResource, readResources } from '@/actions/resource'
import ResourceLink from '@/lib/resource/ResourceLink'
import { StatusTrackerSlab } from '@/lib/ux/StatusTrackerSlab'

export default async function PurchaseDetail({
  params: { key },
  searchParams,
}: {
  params: { key: string }
  searchParams: Record<string, unknown>
}) {
  const { resource, schemaData, lineSchema, user } = await readDetailPageModel(
    'Purchase',
    key,
  )

  const [purchaseLines, purchaseBills] = await Promise.all([
    readResources('PurchaseLine', {
      where: {
        '==': [{ var: fields.purchase.name }, resource.id],
      },
    }),
    readResources('Bill', {
      where: {
        '==': [{ var: fields.purchase.name }, resource.id],
      },
    }),
  ])

  const steps = await readResources('Step', {
    where: {
      '==': [{ var: fields.purchase.name }, resource.id],
    },
  })

  const linkedParts =
    steps
      ?.map((s) => selectResourceFieldValue(s, fields.part)?.resource)
      .filter(isTruthy) ?? []

  const parts = await Promise.all(
    linkedParts.map((part) => readResource(part.id)),
  )

  const linkedJobs = parts
    .filter(isTruthy)
    .map((part) => selectResourceFieldValue(part, fields.job)?.resource)
    .filter(isTruthy)

  const purchaseHasLines = !!purchaseLines?.length

  const status =
    selectResourceFieldValue(resource, fields.purchaseStatus)?.option ??
    fail('Status not found')

  const isDraft = status.templateId === purchaseStatusOptions.draft.templateId

  const hasInvalidFields = isMissingRequiredFields(schemaData, resource)
  const poFile = selectResourceFieldValue(resource, fields.document)?.file

  const vendorTemplateId = selectResourceFieldValue(resource, fields.vendor)
    ?.resource?.templateId
  const isVendorMcMasterCarr =
    vendorTemplateId === resources.mcMasterCarrVendor.templateId

  return (
    <ResourceDetailPage
      status={{
        draftStatusOptionTemplate: purchaseStatusOptions.draft,
        cancelStatusOptionTemplate: purchaseStatusOptions.canceled,
        statusFieldTemplate: fields.purchaseStatus,
        currentStatus: status,
      }}
      path={[
        {
          label: 'Purchases',
          href: '/purchases',
        },
        {
          label: resource.key.toString(),
          href: `/purchases/${resource.key}`,
        },
      ]}
      lineSchema={lineSchema ?? undefined}
      schemaData={schemaData}
      resource={resource}
      searchParams={searchParams}
      tools={(fontSize) => [
        ...(purchaseBills?.map((bill) => (
          <ResourceLink
            key={bill.id}
            href={`/bills/${bill.key}`}
            label="Bill"
            resourceKey={bill.key}
            fontSize={fontSize}
          />
        )) ?? []),
        linkedJobs.map((job) => (
          <ResourceLink
            key={job.id}
            href={`/jobs/${job.key}`}
            label="Job"
            resourceKey={job.key}
            fontSize={fontSize}
          />
        )),
        <TrackingControl
          key={TrackingControl.name}
          schemaData={schemaData}
          resource={resource}
          fontSize={fontSize}
        />,
        ...(poFile
          ? [
              <PreviewPoControl
                key={poFile.id}
                file={poFile}
                fontSize={fontSize}
              />,
            ]
          : []),
        ...(poFile
          ? [
              <DownloadPoControl
                key={poFile.id}
                file={poFile}
                fontSize={fontSize}
              />,
            ]
          : []),
        <PurchaseAttachmentsControl
          key={PurchaseAttachmentsControl.name}
          schemaData={schemaData}
          resource={resource}
          fontSize={fontSize}
        />,
        <AssigneeToolbarControl
          key={AssigneeToolbarControl.name}
          schemaData={schemaData}
          resource={resource}
          fontSize={fontSize}
        />,
      ]}
      linesBacklinkField={fields.purchase}
      isReadOnly={!isDraft}
      actions={
        <StatusTrackerSlab
          statuses={Object.values(purchaseStatusOptions)}
          currentStatus={status}
          successStatus={purchaseStatusOptions.received}
          failStatus={purchaseStatusOptions.canceled}
        >
          {isDraft &&
            (isVendorMcMasterCarr && !purchaseHasLines ? (
              <PunchoutButton resource={resource} />
            ) : (
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
            ))}
          {status.templateId === purchaseStatusOptions.submitted.templateId && (
            <>
              <PreviewDraftPoButton resourceId={resource.id} />
              <ApproveButton
                resourceId={resource.id}
                isDisabled={!user.isApprover && !user.isGlobalAdmin}
              />
            </>
          )}
          {status.templateId === purchaseStatusOptions.approved.templateId && (
            <>
              <SendPoButton resource={resource} />
              <SkipButton resourceId={resource.id} />
            </>
          )}
          {status.templateId === purchaseStatusOptions.purchased.templateId && (
            <StatusTransitionButton
              resourceId={resource.id}
              statusOption={purchaseStatusOptions.received}
              label="Confirm Receipt"
            />
          )}
          {(status.templateId === purchaseStatusOptions.received.templateId ||
            status.templateId ===
              purchaseStatusOptions.canceled.templateId) && (
            <Typography sx={{ opacity: 0.5 }}>
              No further action required
            </Typography>
          )}
        </StatusTrackerSlab>
      }
    />
  )
}
