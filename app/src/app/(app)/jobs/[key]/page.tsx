import { fail } from 'assert'
import {
  fields,
  isMissingRequiredFields,
  jobStatusOptions,
  selectResourceFieldValue,
} from '@supplyside/model'
import { Alert, Box, Container, Stack } from '@mui/material'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import JobStatusTracker from './JobStatusTracker'
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

  const statusColorStart = match(status.templateId)
    .with(jobStatusOptions.draft.templateId, () => yellow[600])
    .with(jobStatusOptions.paid.templateId, () => green[900])
    .with(jobStatusOptions.canceled.templateId, () => red[900])
    .otherwise(() => yellow[900])

  const statusColorEnd = match(status.templateId)
    .with(jobStatusOptions.draft.templateId, () => yellow[500])
    .with(jobStatusOptions.paid.templateId, () => green[800])
    .with(jobStatusOptions.canceled.templateId, () => red[800])
    .otherwise(() => yellow[800])

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
        label: status.name,
        color: match(status.templateId)
          .with(jobStatusOptions.draft.templateId, () => 'inactive' as const)
          .with(jobStatusOptions.paid.templateId, () => 'success' as const)
          .with(jobStatusOptions.canceled.templateId, () => 'error' as const)
          .otherwise(() => 'active' as const),
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
        <Stack direction="row" height={100} alignItems="center">
          <Box
            flexGrow={1}
            height={70}
            my="15px"
            sx={{
              background: `linear-gradient(90deg, ${statusColorStart} 0%, ${statusColorEnd} 100%)`,
            }}
          />
          <Container disableGutters>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <JobStatusTracker resource={resource} />
              <Stack
                flexShrink={0}
                direction="row"
                justifyContent="end"
                alignItems="center"
                spacing={2}
                mr={3}
              >
                <CallToAction
                  hasInvalidFields={hasInvalidFields}
                  jobHasLines={jobHasLines}
                  resource={resource}
                  status={status}
                />
              </Stack>
            </Stack>
          </Container>
          <Box flexGrow={1} bgcolor="transparent" />
        </Stack>
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
