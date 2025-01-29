import { fail } from 'assert'
import {
  fields,
  jobStatusOptions,
  OptionTemplate,
  Schema,
  selectResourceFieldValue,
} from '@supplyside/model'
import dayjs from 'dayjs'
import { sortBy } from 'remeda'
import { Description } from '@mui/icons-material'
import { Stack, Tooltip } from '@mui/material'
import LateItem from './LateItem'
import { LateList } from './LateList'
import { TotalCostControl } from '@/lib/resource/TotalCostControl'
import { readSchema } from '@/actions/schema'
import { readResources } from '@/actions/resource'
import OptionChip from '@/lib/resource/fields/views/OptionChip'

export default async function OverdueInvoices() {
  const schemaData = (await readSchema('Job')) ?? fail('Job schema not found')
  const schema = new Schema(schemaData)

  const getStatusOptionId = (optionRef: OptionTemplate) =>
    schema.getFieldOption(fields.jobStatus, optionRef).id

  const resources = await readResources('Job', {
    where: {
      and: [
        {
          '==': [
            { var: fields.jobStatus.name },
            getStatusOptionId(jobStatusOptions.invoiced),
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
    <LateList
      title="Overdue Invoices"
      icon={<Description />}
      count={orderedResources.length}
    >
      {orderedResources.map((resource) => (
        <LateItem
          key={resource.id}
          number={resource.key}
          resourceType="Job"
          daysLate={dayjs().diff(
            dayjs(
              selectResourceFieldValue(resource, fields.paymentDueDate)?.date ??
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
              <TotalCostControl resource={resource} size="small" />
            </Stack>
          }
        />
      ))}
    </LateList>
  )
}
