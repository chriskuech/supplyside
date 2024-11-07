import { fail } from 'assert'
import {
  fields,
  jobStatusOptions,
  OptionTemplate,
  selectResourceFieldValue,
  selectSchemaFieldOptionUnsafe,
} from '@supplyside/model'
import dayjs from 'dayjs'
import { sortBy } from 'remeda'
import { Build } from '@mui/icons-material'
import { Stack, Tooltip } from '@mui/material'
import LateItem from './LateItem'
import { LateList } from './LateList'
import { TotalCostControl } from '@/lib/resource/TotalCostControl'
import { readSchema } from '@/actions/schema'
import { readResources } from '@/actions/resource'
import OptionChip from '@/lib/resource/fields/views/OptionChip'

export default async function LateJobs() {
  const jobSchema = (await readSchema('Job')) ?? fail('Job schema not found')
  const getStatusOptionId = (optionRef: OptionTemplate) =>
    selectSchemaFieldOptionUnsafe(jobSchema, fields.jobStatus, optionRef).id

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
            getStatusOptionId(jobStatusOptions.invoiced),
          ],
        },
        {
          '!=': [
            { var: fields.jobStatus.name },
            getStatusOptionId(jobStatusOptions.canceled),
          ],
        },
        {
          '<': [{ var: fields.needDate.name }, new Date().toISOString()],
        },
      ],
    },
  })

  const orderedResources = sortBy(
    resources ?? [],
    (resource) =>
      selectResourceFieldValue(resource, fields.needDate)?.date ??
      fail('No need date'),
  )

  return (
    <LateList
      title="Late Jobs"
      icon={<Build />}
      count={orderedResources.length}
    >
      {orderedResources.map((resource) => (
        <LateItem
          key={resource.id}
          resourceType="Job"
          number={resource.key}
          daysLate={dayjs().diff(
            dayjs(
              selectResourceFieldValue(resource, fields.needDate)?.date ??
                fail('No need date'),
            ),
            'days',
          )}
          primaryText={
            selectResourceFieldValue(resource, fields.customer)?.resource
              ?.name ?? null
          }
          secondaryText={
            <Stack direction="row" gap={1}>
              <Tooltip title="Job Status">
                <OptionChip
                  option={
                    selectResourceFieldValue(resource, fields.jobStatus)
                      ?.option ?? fail('Job status is missing')
                  }
                  size="small"
                />
              </Tooltip>
              <TotalCostControl
                schema={jobSchema}
                resource={resource}
                size="small"
              />
            </Stack>
          }
        />
      ))}
    </LateList>
  )
}
