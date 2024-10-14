import { fail } from 'assert'
import { fields, selectSchemaFieldUnsafe } from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function BillLines({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const purchaseLineSchema =
    (await readSchema('PurchaseLine')) ?? fail('PurchaseLine schema not found')
  const purchaseField = selectSchemaFieldUnsafe(
    purchaseLineSchema,
    fields.purchase,
  )

  const purchasesLines: GridFilterItem = {
    field: purchaseField.fieldId,
    operator: 'isNotEmpty',
  }

  return (
    <ListPage
      tableKey="purchaseLinesList"
      resourceType="PurchaseLine"
      searchParams={searchParams}
      filterItems={[purchasesLines]}
      title="Purchase lines"
    />
  )
}
