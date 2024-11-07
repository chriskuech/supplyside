import { fail } from 'assert'
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
import { Stack, Tooltip } from '@mui/material'
import LateItem from './LateItem'
import { LateList } from './LateList'
import { TotalCostControl } from '@/lib/resource/TotalCostControl'
import { readSchema } from '@/actions/schema'
import { readResources } from '@/actions/resource'
import OptionChip from '@/lib/resource/fields/views/OptionChip'

export default async function LatePurchases() {
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
    <LateList
      title="Late Purchases"
      icon={<ShoppingBag />}
      count={orderedResources.length}
    >
      {orderedResources.map((resource) => (
        <LateItem
          key={resource.id}
          resourceType="Purchase"
          number={resource.key}
          daysLate={dayjs().diff(
            dayjs(
              selectResourceFieldValue(resource, fields.needDate)?.date ??
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
              <Tooltip title="Purchase Status">
                <OptionChip
                  option={
                    selectResourceFieldValue(resource, fields.purchaseStatus)
                      ?.option ?? fail('Purchase status is missing')
                  }
                  size="small"
                />
              </Tooltip>

              <TotalCostControl
                resource={resource}
                schema={purchaseSchema}
                size="small"
              />
            </Stack>
          }
        />
      ))}
    </LateList>
  )
}
