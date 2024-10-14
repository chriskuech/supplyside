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
  const billField = selectSchemaFieldUnsafe(purchaseLineSchema, fields.bill)

  const billsLines: GridFilterItem = {
    field: billField.fieldId,
    operator: 'isNotEmpty',
  }

  return (
    <ListPage
      tableKey="billLinesList"
      resourceType="PurchaseLine"
      searchParams={searchParams}
      filterItems={[billsLines]}
      title="Bill lines"
    />
  )
}
