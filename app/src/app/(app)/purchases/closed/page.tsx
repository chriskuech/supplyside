import { fail } from 'assert'
import {
  fields,
  purchaseStatusOptions,
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function ClosedPurchases({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const purchaseSchema =
    (await readSchema('Purchase')) ?? fail('purchase schema not found')

  const purchaseStatusField = selectSchemaFieldUnsafe(
    purchaseSchema,
    fields.purchaseStatus,
  )
  const purchaseStatusReceivedOptionId = selectSchemaFieldOptionUnsafe(
    purchaseSchema,
    fields.purchaseStatus,
    purchaseStatusOptions.received,
  ).id
  const purchaseStatusCanceledOptionId = selectSchemaFieldOptionUnsafe(
    purchaseSchema,
    fields.purchaseStatus,
    purchaseStatusOptions.canceled,
  ).id

  const closedPurchasesFilter: GridFilterItem = {
    field: purchaseStatusField.fieldId,
    operator: 'isAnyOf',
    value: [purchaseStatusReceivedOptionId, purchaseStatusCanceledOptionId],
  }

  return (
    <ListPage
      tableKey="purchasesList"
      resourceType="Purchase"
      searchParams={searchParams}
      filterItems={[closedPurchasesFilter]}
      title="Closed Purchases"
    />
  )
}
