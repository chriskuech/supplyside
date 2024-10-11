import { fail } from 'assert'
import {
  fields,
  isMissingRequiredFields,
  jobStatusOptions,
  selectResourceFieldValue,
} from '@supplyside/model'
import { Container, Stack, Typography } from '@mui/material'
import EditControl from '../tools/editControl'
import CancelControl from '../tools/CancelControl'
import StatusTransitionButton from './cta/StatusTransitionButton'
import JobStatusTracker from './JobStatusTracker'
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

  return (
    <ResourceDetailPage
      lineSchema={lineSchema}
      schema={schema}
      resource={resource}
      searchParams={searchParams}
      isReadOnly={!isDraft}
      tools={[
        ...(!isDraft
          ? [<EditControl key={EditControl.name} resourceId={resource.id} />]
          : []),
        <CancelControl key={CancelControl.name} resourceId={resource.id} />,
      ]}
      backlinkField={fields.job}
      actions={
        <Container disableGutters>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <JobStatusTracker resource={resource} />
            {status.templateId === jobStatusOptions.draft.templateId && (
              <StatusTransitionButton
                isDisabled={hasInvalidFields || !jobHasLines}
                resourceId={resource.id}
                statusOption={jobStatusOptions.ordered}
                label="Ordered"
              />
            )}
            {status.templateId === jobStatusOptions.ordered.templateId && (
              <StatusTransitionButton
                resourceId={resource.id}
                statusOption={jobStatusOptions.inProcess}
                label="In process"
              />
            )}
            {status.templateId === jobStatusOptions.inProcess.templateId && (
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
              status.templateId === jobStatusOptions.canceled.templateId) && (
              <Typography sx={{ opacity: 0.5 }}>
                No further action required
              </Typography>
            )}
          </Stack>
        </Container>
      }
    />
  )
}
