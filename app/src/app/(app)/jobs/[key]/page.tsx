import { fail } from 'assert'
import {
  fields,
  isMissingRequiredFields,
  jobStatusOptions,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import StatusTransitionButton from './cta/StatusTransitionButton'
import JobStatusTracker from './JobStatusTracker'
import { JobAttachmentsControl } from './tools/JobAttachmentsControl'
import { JobLinesControl } from './JobLinesControl'
import { ScheduleControl } from './tools/ScheduleControl'
import { PaymentControl } from './tools/PaymentControl'
import { TotalCostControl } from './tools/TotalCostControl'
import { OrderedCta } from './cta/OrderedCta'
import { InProcessCta } from './cta/InProcessCta'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'
import { readResources } from '@/actions/resource'
import FieldControl from '@/lib/resource/fields/FieldControl'

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
      header={
        <Box fontSize={13} width={500}>
          <FieldControl
            resource={resource}
            value={selectResourceFieldValue(resource, fields.jobDescription)}
            inputId="job-description"
            field={selectSchemaFieldUnsafe(schema, fields.jobDescription)}
            inputProps={{
              size: 'small',
              sx: { fontSize: 12 },
              placeholder: 'Job Description',
            }}
          />
        </Box>
      }
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
    >
      {status.templateId === jobStatusOptions.draft.templateId && (
        <Card
          variant="elevation"
          sx={{
            border: '1px solid',
            borderColor: 'secondary.main',
            py: 5,
            px: 8,
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-evenly"
              alignItems="start"
            >
              <Box width={400}>
                <Typography variant="h6">
                  Customer
                  <Required />
                </Typography>
                <FieldControl
                  resource={resource}
                  value={selectResourceFieldValue(resource, fields.customer)}
                  inputId="customer-field"
                  field={selectSchemaFieldUnsafe(schema, fields.customer)}
                />
              </Box>
              <Stack width={280} spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="subtitle2"
                    flexGrow={1}
                    width={100}
                    lineHeight={1}
                  >
                    Need Date
                    <Required />
                  </Typography>
                  <Box width={170}>
                    <FieldControl
                      resource={resource}
                      value={selectResourceFieldValue(
                        resource,
                        fields.needDate,
                      )}
                      inputId="need-date-field"
                      field={selectSchemaFieldUnsafe(schema, fields.needDate)}
                      datePickerProps={{ slotProps: { field: {} } }}
                    />
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    variant="subtitle2"
                    flexGrow={1}
                    width={100}
                    lineHeight={1}
                  >
                    Payment Terms
                    <Required />
                  </Typography>
                  <Box width={115}>
                    <FieldControl
                      resource={resource}
                      value={selectResourceFieldValue(
                        resource,
                        fields.paymentTerms,
                      )}
                      inputId="payment-terms-field"
                      field={selectSchemaFieldUnsafe(
                        schema,
                        fields.paymentTerms,
                      )}
                    />
                  </Box>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}
      {status.templateId === jobStatusOptions.ordered.templateId && (
        <OrderedCta schema={schema} resource={resource} />
      )}
      {status.templateId === jobStatusOptions.inProcess.templateId && (
        <InProcessCta resource={resource} />
      )}
      <JobLinesControl
        job={resource}
        jobLineSchema={lineSchema}
        jobLines={jobLines}
      />
    </ResourceDetailPage>
  )
}

const Required = () => (
  <Typography
    color="error"
    display="inline"
    fontWeight="bold"
    ml={0.5}
    lineHeight={1}
    // sx={{ verticalAlign: 'super' }}
  >
    *
  </Typography>
)
