import { fail } from 'assert'
import {
  fields,
  isMissingRequiredFields,
  jobStatusOptions,
  selectResourceFieldValue,
} from '@supplyside/model'
import { Alert } from '@mui/material'
import { JobAttachmentsControl } from './tools/JobAttachmentsControl'
import CallToAction from './cta/CallToAction'
import { JobLinesControl } from './JobLinesControl'
import { ScheduleControl } from './tools/ScheduleControl'
import { PaymentControl } from './tools/PaymentControl'
import { TotalCostControl } from './tools/TotalCostControl'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'
import { readResources } from '@/actions/resource'
import { getInvoiceUrl } from '@/lib/quickBooks/helpers'
import QuickBooksLink from '@/lib/quickBooks/QuickBooksLink'
import { StatusTrackerSlab } from '@/lib/ux/StatusTrackerSlab'

export default async function JobDetail({
  params: { key },
  searchParams,
}: {
  params: { key: string }
  searchParams: Record<string, unknown>
}) {
  const { resource, schema, lineSchema } = await readDetailPageModel('Job', key)

  const status =
    selectResourceFieldValue(resource, fields.jobStatus)?.option ??
    fail('Status not found')
  const isDraft = status.templateId === jobStatusOptions.draft.templateId
  const hasInvalidFields = isMissingRequiredFields(schema, resource)

  const jobLines = await readResources('JobLine', {
    where: {
      '==': [{ var: fields.job.name }, resource.id],
    },
  })
  const jobHasLines = !!jobLines?.length

  const quickBooksInvoiceId = selectResourceFieldValue(
    resource,
    fields.quickBooksInvoiceId,
  )?.string

  const quickBooksInvoiceUrl = quickBooksInvoiceId
    ? getInvoiceUrl(quickBooksInvoiceId)
    : undefined

  if (!lineSchema || !jobLines)
    return <Alert severity="error">Failed to load job</Alert>

  return (
    <ResourceDetailPage
      customerName={
        selectResourceFieldValue(resource, fields.customer)?.resource?.name
      }
      status={{
        cancelStatusOptionTemplate: jobStatusOptions.canceled,
        draftStatusOptionTemplate: jobStatusOptions.draft,
        statusFieldTemplate: fields.jobStatus,
        currentStatus: status,
      }}
      path={[
        {
          label: 'Jobs',
          href: '/jobs',
        },
        {
          label: resource.key.toString(),
          href: `/jobs/${resource.key}`,
        },
      ]}
      linkedResources={[
        {
          resourceType: 'Purchase',
          backlinkField: fields.job,
        },
      ]}
      schema={schema}
      resource={resource}
      searchParams={searchParams}
      isReadOnly={!isDraft}
      tools={(fontSize) => [
        ...(quickBooksInvoiceUrl
          ? [
              <QuickBooksLink
                key={QuickBooksLink.name}
                quickBooksAppUrl={quickBooksInvoiceUrl}
                fontSize={fontSize}
              />,
            ]
          : []),
        <TotalCostControl
          key={TotalCostControl.name}
          schema={schema}
          resource={resource}
          size={fontSize}
        />,
        <ScheduleControl
          key={ScheduleControl.name}
          schema={schema}
          resource={resource}
          size={fontSize}
        />,
        <PaymentControl
          key={PaymentControl.name}
          resource={resource}
          size={fontSize}
        />,
        <JobAttachmentsControl
          key={JobAttachmentsControl.name}
          schema={schema}
          resource={resource}
          fontSize={fontSize}
        />,
      ]}
      actions={
        <StatusTrackerSlab
          statuses={Object.values(jobStatusOptions)}
          currentStatus={status}
          successStatus={jobStatusOptions.paid}
          failStatus={jobStatusOptions.canceled}
        >
          <CallToAction
            hasInvalidFields={hasInvalidFields}
            jobHasLines={jobHasLines}
            resource={resource}
            status={status}
          />
        </StatusTrackerSlab>
      }
    >
      <JobLinesControl
        job={resource}
        jobLineSchema={lineSchema}
        jobLines={jobLines}
      />
    </ResourceDetailPage>
  )
}
