import { fail } from 'assert'
import { fields, purchaseStatusOptions, Schema } from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function ClosedPurchases({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const purchaseSchemaData =
    (await readSchema('Purchase')) ?? fail('purchase schema not found')
  const purchaseSchema = new Schema(purchaseSchemaData)
  const purchaseStatusField = purchaseSchema.getField(fields.purchaseStatus)
  const purchaseStatusReceivedOptionId = purchaseSchema.getFieldOption(
    fields.purchaseStatus,
    purchaseStatusOptions.received,
  ).id
  const purchaseStatusCanceledOptionId = purchaseSchema.getFieldOption(
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
