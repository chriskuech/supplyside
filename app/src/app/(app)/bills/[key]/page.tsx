import { fail } from 'assert'
import {
  billStatusOptions,
  fields,
  selectResourceFieldValue,
} from '@supplyside/model'
import { Container, Stack, Tooltip } from '@mui/material'
import { EventRepeat } from '@mui/icons-material'
import CallToAction from './CallToAction'
import { BillAttachmentsControl } from './tools/BillAttachmentsControl'
import AssigneeToolbarControl from '@/lib/resource/detail/AssigneeToolbarControl'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'
import AttachmentsToolbarControl from '@/lib/resource/detail/AttachmentsToolbarControl'
import QuickBooksLink from '@/lib/quickBooks/QuickBooksLink'
import { getBillUrl } from '@/lib/quickBooks/helpers'
import ResourceLink from '@/lib/resource/ResourceLink'
import { StatusTrackerSlab } from '@/lib/ux/StatusTrackerSlab'
import RecurringControl from '@/lib/resource/recurring/RecurringControl'
import RecurringCard from '@/lib/resource/recurring/RecurringCard'
import RecurrentResourceLink from '@/lib/resource/RecurrentResourceLink'

export default async function BillsDetail({
  params: { key },
  searchParams,
}: {
  params: { key: string }
  searchParams: Record<string, unknown>
}) {
  const { resource, schemaData, lineSchema, user } = await readDetailPageModel(
    'Bill',
    key,
  )

  const status =
    selectResourceFieldValue(resource, fields.billStatus)?.option ??
    fail('Status not found')

  const isDraft = status.templateId === billStatusOptions.draft.templateId

  const purchase = selectResourceFieldValue(resource, fields.purchase)?.resource

  const quickBooksBillId = selectResourceFieldValue(
    resource,
    fields.quickBooksBillId,
  )?.string

  const quickBooksAppUrl = quickBooksBillId
    ? getBillUrl(quickBooksBillId)
    : undefined

  const isRecurring = selectResourceFieldValue(
    resource,
    fields.recurring,
  )?.boolean

  const parentRecurringBill = selectResourceFieldValue(
    resource,
    fields.parentRecurrentBill,
  )?.resource

  const parentClonedBill = selectResourceFieldValue(
    resource,
    fields.parentClonedBill,
  )?.resource

  return (
    <ResourceDetailPage
      status={
        !isRecurring
          ? {
              cancelStatusOptionTemplate: billStatusOptions.canceled,
              draftStatusOptionTemplate: billStatusOptions.draft,
              statusFieldTemplate: fields.billStatus,
              currentStatus: status,
            }
          : undefined
      }
      path={[
        {
          label: 'Bills',
          href: '/bills',
        },
        {
          label: resource.key.toString(),
          href: `/bills/${resource.key}`,
        },
      ]}
      lineSchema={lineSchema ?? undefined}
      schemaData={schemaData}
      resource={resource}
      searchParams={searchParams}
      tools={(fontSize) => [
        ...(quickBooksAppUrl
          ? [
              <QuickBooksLink
                key={QuickBooksLink.name}
                quickBooksAppUrl={quickBooksAppUrl}
                fontSize={fontSize}
              />,
            ]
          : []),
        ...(purchase
          ? [
              <ResourceLink
                key={purchase.id}
                href={`/purchases/${purchase.key}`}
                label="Purchase"
                resourceKey={purchase.key}
                fontSize={fontSize}
              />,
            ]
          : []),
        ...(parentClonedBill
          ? [
              <ResourceLink
                key={parentClonedBill.id}
                href={`/bills/${parentClonedBill.key}`}
                label="Duplicated Bill"
                resourceKey={parentClonedBill.key}
                fontSize={fontSize}
              />,
            ]
          : []),
        ...(parentRecurringBill
          ? [
              <RecurrentResourceLink
                key={parentRecurringBill.id}
                href={`/bills/${parentRecurringBill.key}`}
                label="Recurring Bill"
                fontSize={fontSize}
              />,
            ]
          : []),
        ...(!parentRecurringBill && !isRecurring
          ? [
              <RecurringControl
                key={RecurringControl.name}
                resource={resource}
                fontSize={fontSize}
              />,
            ]
          : []),
        <BillAttachmentsControl
          key={AttachmentsToolbarControl.name}
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
      linesBacklinkField={fields.bill}
      isReadOnly={!isDraft}
      title={
        isRecurring
          ? [
              <Stack justifyContent="center" key={EventRepeat.name}>
                <Tooltip title="Recurring Bill">
                  <EventRepeat fontSize="small" color="action" />
                </Tooltip>
              </Stack>,
            ]
          : undefined
      }
      actions={
        <>
          {!isRecurring ? (
            <StatusTrackerSlab
              statuses={Object.values(billStatusOptions)}
              currentStatus={status}
              successStatus={billStatusOptions.paid}
              failStatus={billStatusOptions.canceled}
            >
              <CallToAction
                key={
                  selectResourceFieldValue(resource, fields.billStatus)?.option
                    ?.id
                }
                schemaData={schemaData}
                self={user}
                resource={resource}
              />
            </StatusTrackerSlab>
          ) : (
            <Container>
              <RecurringCard schemaData={schemaData} resource={resource} />
            </Container>
          )}
        </>
      }
    />
  )
}
