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
import { Receipt } from '@mui/icons-material'
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
    <Card variant="outlined" sx={{ flex: 1 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        gap={1}
        py={2}
      >
        <Receipt />
        <Typography variant="h5">Overdue Bills</Typography>
      </Stack>
      <List sx={{ overflow: 'auto', height: '100%' }}>
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
