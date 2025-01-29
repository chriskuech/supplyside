import { fail } from 'assert'
import {
  billStatusOptions,
  fields,
  OptionTemplate,
  Schema,
  selectResourceFieldValue,
} from '@supplyside/model'
import dayjs from 'dayjs'
import { sortBy } from 'remeda'
import { Receipt } from '@mui/icons-material'
import { Stack, Tooltip } from '@mui/material'
import LateItem from './LateItem'
import { LateList } from './LateList'
import { TotalCostControl } from '@/lib/resource/TotalCostControl'
import { readSchema } from '@/actions/schema'
import { readResources } from '@/actions/resource'
import OptionChip from '@/lib/resource/fields/views/OptionChip'

export default async function OverdueBills() {
  const schemaData = (await readSchema('Bill')) ?? fail('Bill schema not found')
  const schema = new Schema(schemaData)

  const getStatusOptionId = (optionRef: OptionTemplate) =>
    schema.getFieldOption(fields.billStatus, optionRef).id

  const resources = await readResources('Bill', {
    where: {
      and: [
        {
          '!=': [
            { var: fields.billStatus.name },
            getStatusOptionId(billStatusOptions.paid),
          ],
        },
        {
          '!=': [
            { var: fields.billStatus.name },
            getStatusOptionId(billStatusOptions.canceled),
          ],
        },
        {
          '<': [{ var: fields.paymentDueDate.name }, new Date().toISOString()],
        },
        {
          '==': [{ var: fields.recurring.name }, null],
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
      icon={<Receipt />}
      title="Overdue Bills"
      count={orderedResources.length}
    >
      {orderedResources.map((resource) => (
        <LateItem
          key={resource.id}
          resourceType="Bill"
          number={resource.key}
          daysLate={dayjs().diff(
            dayjs(
              selectResourceFieldValue(resource, fields.paymentDueDate)?.date ??
                fail('No need date'),
            ),
            'days',
          )}
          primaryText={
            selectResourceFieldValue(resource, fields.vendor)?.resource?.name ??
            null
          }
          secondaryText={
            <Stack direction="row" gap={1}>
              <Tooltip title="Bill Status">
                <OptionChip
                  option={
                    selectResourceFieldValue(resource, fields.billStatus)
                      ?.option ?? fail('Bill status is missing')
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
