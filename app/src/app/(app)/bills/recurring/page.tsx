import { fail } from 'assert'
import { fields, Schema } from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import { BillsInboxControl } from '../BillsInboxControl'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function RecurringBills({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const schemaData = (await readSchema('Bill')) ?? fail('Bill schema not found')
  const schema = new Schema(schemaData)

  const recurringBillsFilter: GridFilterItem = {
    field: schema.getField(fields.recurring).fieldId,
    operator: 'is',
    value: 'true',
  }

  return (
    <ListPage
      tableKey="recurringBillsList"
      resourceType="Bill"
      searchParams={searchParams}
      filterItems={[recurringBillsFilter]}
      title="Recurring Bills"
      callToActions={[<BillsInboxControl key={BillsInboxControl.name} />]}
    />
  )
}
