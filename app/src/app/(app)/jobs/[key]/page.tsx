import { fail } from 'assert'
import {
  fields,
  isMissingRequiredFields,
  jobStatusOptions,
  selectResourceFieldValue,
} from '@supplyside/model'
import { Box, Container, Stack, Typography } from '@mui/material'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import StatusTransitionButton from './cta/StatusTransitionButton'
import JobStatusTracker from './JobStatusTracker'
import EditControl from './tools/EditControl'
import CancelControl from './tools/CancelControl'
import { JobAttachmentsControl } from './tools/JobAttachmentsControl'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'
import { readResources } from '@/actions/resource'

export default async function JobsDetail({
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

  return (
    <ResourceDetailPage
      lineSchema={lineSchema}
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
      tools={[
        <JobAttachmentsControl
          key={JobAttachmentsControl.name}
          schema={schema}
          resource={resource}
        />,
        ...(!isDraft
          ? [<EditControl key={EditControl.name} resourceId={resource.id} />]
          : []),
        <CancelControl key={CancelControl.name} resourceId={resource.id} />,
      ]}
      linesBacklinkField={fields.job}
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
                {status.templateId === jobStatusOptions.draft.templateId && (
                  <StatusTransitionButton
                    isDisabled={hasInvalidFields || !jobHasLines}
                    resourceId={resource.id}
                    statusOption={jobStatusOptions.ordered}
                    label="Ordered"
                    tooltip={
                      hasInvalidFields || !jobHasLines
                        ? 'Please fill in all required fields and add at least one Line before submitting'
                        : undefined
                    }
                  />
                )}
                {status.templateId === jobStatusOptions.ordered.templateId && (
                  <StatusTransitionButton
                    resourceId={resource.id}
                    statusOption={jobStatusOptions.inProcess}
                    label="In Process"
                  />
                )}
                {status.templateId ===
                  jobStatusOptions.inProcess.templateId && (
                  <StatusTransitionButton
                    resourceId={resource.id}
                    statusOption={jobStatusOptions.shipped}
                    label="Shipped"
                  />
                )}
                {status.templateId === jobStatusOptions.shipped.templateId && (
                  <StatusTransitionButton
                    resourceId={resource.id}
                    statusOption={jobStatusOptions.invoiced}
                    label="Invoiced"
                  />
                )}
                {status.templateId === jobStatusOptions.invoiced.templateId && (
                  <StatusTransitionButton
                    resourceId={resource.id}
                    statusOption={jobStatusOptions.paid}
                    label="Paid"
                  />
                )}
                {(status.templateId === jobStatusOptions.paid.templateId ||
                  status.templateId ===
                    jobStatusOptions.canceled.templateId) && (
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
