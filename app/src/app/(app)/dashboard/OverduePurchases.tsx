import { fail } from 'assert'
import { Card, List, Stack, Typography } from '@mui/material'
import {
  fields,
  OptionTemplate,
  purchaseStatusOptions,
  selectResourceFieldValue,
  selectSchemaFieldOptionUnsafe,
} from '@supplyside/model'
import dayjs from 'dayjs'
import { sortBy } from 'remeda'
import { ShoppingBag } from '@mui/icons-material'
import { readSchema } from '@/actions/schema'
import { readResources } from '@/actions/resource'
import ResourceListItem from '@/lib/resource/ResourceListItem'
import { formatMoney } from '@/lib/format'

export default async function OverduePurchases() {
  const purchaseSchema =
    (await readSchema('Purchase')) ?? fail('Purchase schema not found')
  const getStatusOptionId = (optionRef: OptionTemplate) =>
    selectSchemaFieldOptionUnsafe(
      purchaseSchema,
      fields.purchaseStatus,
      optionRef,
    ).id

  const resources = await readResources('Purchase', {
    where: {
      and: [
        {
          '!=': [
            { var: fields.purchaseStatus.name },
            getStatusOptionId(purchaseStatusOptions.received),
          ],
        },
        {
          '!=': [
            { var: fields.purchaseStatus.name },
            getStatusOptionId(purchaseStatusOptions.canceled),
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
    <Card variant="outlined">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        gap={1}
        pt={2}
      >
        <ShoppingBag />
        <Typography variant="h5">Overdue Purchases</Typography>
      </Stack>
      <List>
        {!!orderedResources.length &&
          orderedResources.map((resource) => (
            <ResourceListItem
              key={resource.id}
              href={`/purchases/${resource.key}`}
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
                        selectResourceFieldValue(resource, fields.needDate)
                          ?.date ?? fail('No need date'),
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
