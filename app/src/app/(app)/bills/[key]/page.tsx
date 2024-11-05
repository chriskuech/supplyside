import { fail } from 'assert'
import { match } from 'ts-pattern'
import {
  billStatusOptions,
  fields,
  selectResourceFieldValue,
  selectSchemaField,
} from '@supplyside/model'
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

export default async function BillsDetail({
  params: { key },
  searchParams,
}: {
  params: { key: string }
  searchParams: Record<string, unknown>
}) {
  const { resource, schema, lineSchema, user } = await readDetailPageModel(
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

  return (
    <ResourceDetailPage
      status={{
        cancelStatusOptionTemplate: billStatusOptions.canceled,
        draftStatusOptionTemplate: billStatusOptions.draft,
        statusFieldTemplate: fields.billStatus,
        color: match(status.templateId)
          .with(billStatusOptions.draft.templateId, () => 'inactive' as const)
          .with(billStatusOptions.paid.templateId, () => 'success' as const)
          .with(billStatusOptions.canceled.templateId, () => 'error' as const)
          .otherwise(() => 'active' as const),
        label: status.name,
      }}
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
      schema={schema}
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
        <BillAttachmentsControl
          key={AttachmentsToolbarControl.name}
          schema={schema}
          resource={resource}
          fontSize={fontSize}
        />,
        <AssigneeToolbarControl
          key={AssigneeToolbarControl.name}
          resource={resource}
          resourceType="Bill"
          field={
            selectSchemaField(schema, fields.assignee) ??
            fail('Field not found')
          }
          value={selectResourceFieldValue(resource, fields.assignee)}
          fontSize={fontSize}
        />,
      ]}
      linesBacklinkField={fields.bill}
      isReadOnly={!isDraft}
      actions={
        <StatusTrackerSlab
          statuses={Object.values(billStatusOptions)}
          currentStatus={status}
          successStatus={billStatusOptions.paid}
          failStatus={billStatusOptions.canceled}
        >
          <CallToAction
            key={
              selectResourceFieldValue(resource, fields.billStatus)?.option?.id
            }
            schema={schema}
            self={user}
            resource={resource}
          />
        </StatusTrackerSlab>
      }
    />
  )
}
