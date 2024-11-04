import { fail } from 'assert'
import { Card, List, Stack, Typography } from '@mui/material'
import {
  fields,
  jobStatusOptions,
  OptionTemplate,
  selectResourceFieldValue,
  selectSchemaFieldOptionUnsafe,
} from '@supplyside/model'
import dayjs from 'dayjs'
import { sortBy } from 'remeda'
import { Description } from '@mui/icons-material'
import { readSchema } from '@/actions/schema'
import { readResources } from '@/actions/resource'
import ResourceListItem from '@/lib/resource/ResourceListItem'
import { formatMoney } from '@/lib/format'

export default async function OverdueInvoices() {
  const JobSchema = (await readSchema('Job')) ?? fail('Job schema not found')
  const getStatusOptionId = (optionRef: OptionTemplate) =>
    selectSchemaFieldOptionUnsafe(JobSchema, fields.jobStatus, optionRef).id

  const resources = await readResources('Job', {
    where: {
      and: [
        {
          '!=': [
            { var: fields.jobStatus.name },
            getStatusOptionId(jobStatusOptions.paid),
          ],
        },
        {
          '!=': [
            { var: fields.jobStatus.name },
            getStatusOptionId(jobStatusOptions.canceled),
          ],
        },
        {
          '<': [{ var: fields.paymentDueDate.name }, new Date().toISOString()],
        },
      ],
    },
  })

  const orderedResources = sortBy(
    resources ?? [],
    (resource) =>
      selectResourceFieldValue(resource, fields.paymentDueDate)?.date ??
      fail('No payment need date'),
  )

  return (
    <Card variant="outlined">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        gap={1}
        pt={2}
      >
        <Description />
        <Typography variant="h5">Overdue Invoices</Typography>
      </Stack>
      <List>
        {!!orderedResources.length &&
          orderedResources.map((resource) => (
            <ResourceListItem
              key={resource.id}
              href={`/jobs/${resource.key}`}
              primaryText={
                <Typography>
                  <b>
                    {selectResourceFieldValue(resource, fields.customer)
                      ?.resource?.name ?? '-'}
                  </b>
                  {` #${resource.key} `}
                </Typography>
              }
              secondaryText={
                <Stack>
                  <Typography variant="caption">
                    <b>Total Cost: </b>
                    {formatMoney(
                      selectResourceFieldValue(resource, fields.totalCost)
                        ?.number,
                    )}
                  </Typography>
                  <Typography variant="caption">
                    <b>Days Overdue: </b>
                    {dayjs().diff(
                      dayjs(
                        selectResourceFieldValue(
                          resource,
                          fields.paymentDueDate,
                        )?.date ?? fail('No need date'),
                      ),
                      'days',
                    )}
                  </Typography>
                </Stack>
              }
            />
          ))}
        {!orderedResources.length && (
          <Typography textAlign="center">Nothing overdue</Typography>
        )}
      </List>
    </Card>
  )
}
