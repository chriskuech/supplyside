import { fail } from 'assert'
import { fields, Schema } from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function PurchaseLines({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const purchaseLineSchemaData =
    (await readSchema('PurchaseLine')) ?? fail('PurchaseLine schema not found')
  const purchaseLineSchema = new Schema(purchaseLineSchemaData)

  const purchasesLines: GridFilterItem = {
    field: purchaseLineSchema.getField(fields.purchase).fieldId,
    operator: 'isNotEmpty',
  }

  return (
    <ListPage
      tableKey="purchaseLinesList"
      resourceType="PurchaseLine"
      searchParams={searchParams}
      filterItems={[purchasesLines]}
    />
  )
}
