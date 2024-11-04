import { fail } from 'assert'
import { Card, List, Stack, Typography } from '@mui/material'
import {
  billStatusOptions,
  fields,
  OptionTemplate,
  selectResourceFieldValue,
  selectSchemaFieldOptionUnsafe,
} from '@supplyside/model'
import dayjs from 'dayjs'
import { sortBy } from 'remeda'
import { readSchema } from '@/actions/schema'
import { readResources } from '@/actions/resource'
import ResourceListItem from '@/lib/resource/ResourceListItem'
import { formatMoney } from '@/lib/format'

export default async function OverdueBills() {
  const billSchema = (await readSchema('Bill')) ?? fail('Bill schema not found')
  const getStatusOptionId = (optionRef: OptionTemplate) =>
    selectSchemaFieldOptionUnsafe(billSchema, fields.billStatus, optionRef).id

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
      <Typography variant="h5" textAlign="center" pt={2}>
        Overdue Bills
      </Typography>
      <List>
        {!!orderedResources.length &&
          orderedResources.map((resource) => (
            <ResourceListItem
              key={resource.id}
              href={`/bills/${resource.key}`}
              primaryText={
                <Typography>
                  <b>
                    {selectResourceFieldValue(resource, fields.vendor)?.resource
                      ?.name ?? '-'}
                  </b>
                  {` #${resource.key} `}
                </Typography>
              }
              secondaryText={
                <Stack>
                  <Typography variant="caption">
                    Total Cost:{' '}
                    {formatMoney(
                      selectResourceFieldValue(resource, fields.totalCost)
                        ?.number,
                    )}
                  </Typography>
                  <Typography variant="caption">
                    Days Overdue:{' '}
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
