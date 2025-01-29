import { fail } from 'assert'
import { billStatusOptions, fields, Schema } from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import { BillsInboxControl } from '../BillsInboxControl'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function ClosedBills({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const billSchemaData =
    (await readSchema('Bill')) ?? fail('Bill schema not found')

  const billSchema = new Schema(billSchemaData)

  const closedBillsFilter: GridFilterItem = {
    field: billSchema.getField(fields.billStatus).fieldId,
    operator: 'isAnyOf',
    value: [
      billSchema.getFieldOption(fields.billStatus, billStatusOptions.paid).id,
      billSchema.getFieldOption(fields.billStatus, billStatusOptions.canceled)
        .id,
    ],
  }

  const recurringBillsFilter: GridFilterItem = {
    field: billSchema.getField(fields.recurring).fieldId,
    operator: 'is',
    value: 'false',
  }

  return (
    <ListPage
      tableKey="billsList"
      resourceType="Bill"
      searchParams={searchParams}
      filterItems={[closedBillsFilter, recurringBillsFilter]}
      title="Closed Bills"
      callToActions={[<BillsInboxControl key={BillsInboxControl.name} />]}
    />
  )
}
