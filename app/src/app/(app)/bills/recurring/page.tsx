import { fail } from 'assert'
import { fields, selectSchemaFieldUnsafe } from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import { BillsInboxControl } from '../BillsInboxControl'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function RecurringBills({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const billSchema = (await readSchema('Bill')) ?? fail('Bill schema not found')

  const billRecurringField = selectSchemaFieldUnsafe(
    billSchema,
    fields.recurring,
  )

  const recurringBillsFilter: GridFilterItem = {
    field: billRecurringField.fieldId,
    operator: 'is',
    value: 'true',
  }

  return (
    <ListPage
      tableKey="billsList"
      resourceType="Bill"
      searchParams={searchParams}
      filterItems={[recurringBillsFilter]}
      title="Recurring Bills"
      callToActions={[<BillsInboxControl key={BillsInboxControl.name} />]}
    />
  )
}
