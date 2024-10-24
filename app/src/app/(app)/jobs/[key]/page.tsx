import { fail } from 'assert'
import {
  fields,
  isMissingRequiredFields,
  jobStatusOptions,
  selectResourceFieldValue,
} from '@supplyside/model'
import { Box, Container, Stack, Tooltip } from '@mui/material'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import { Cancel, CheckCircle } from '@mui/icons-material'
import JobStatusTracker from './JobStatusTracker'
import EditControl from './tools/EditControl'
import CancelControl from './tools/CancelControl'
import { JobAttachmentsControl } from './tools/JobAttachmentsControl'
import CallToAction from './cta/CallToAction'
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

  const receivedAllPurchases = selectResourceFieldValue(
    resource,
    fields.receivedAllPurchases,
  )?.boolean

  return (
    <ResourceDetailPage
      status={{
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
      lineSchema={lineSchema ?? undefined}
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
        <JobAttachmentsControl
          key={JobAttachmentsControl.name}
          schema={schema}
          resource={resource}
          fontSize={fontSize}
        />,
        ...(!isDraft
          ? [
              <EditControl
                key={EditControl.name}
                resourceId={resource.id}
                fontSize={fontSize}
              />,
            ]
          : []),
        <CancelControl
          key={CancelControl.name}
          resourceId={resource.id}
          fontSize={fontSize}
        />,
      ]}
      linesBacklinkField={fields.job}
      specialColumnWidths={{
        [fields.partName.name]: 320,
        [fields.partNumber.name]: 320,
      }}
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
                {[
                  jobStatusOptions.ordered.templateId,
                  jobStatusOptions.inProcess.templateId,
                ].includes(status.templateId as string) && (
                  <Tooltip
                    title={
                      receivedAllPurchases
                        ? 'All Purchases required for this Job have been received'
                        : 'Some Purchases required for this Job have not been received'
                    }
                  >
                    {receivedAllPurchases ? (
                      <CheckCircle color="success" fontSize="large" />
                    ) : (
                      <Cancel color="error" fontSize="large" />
                    )}
                  </Tooltip>
                )}
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
    />
  )
}
