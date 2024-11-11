import { fail } from 'assert'
import { fields, selectSchemaFieldUnsafe } from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import { BillsInboxControl } from './BillsInboxControl'
import GridApiCharts from './charts/GridApiCharts'
import { readSchema } from '@/actions/schema'
import ListPage from '@/lib/resource/ListPage'

export default async function Bills({
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
    value: 'false',
  }

  return (
    <ListPage
      tableKey="billsList"
      resourceType="Bill"
      searchParams={searchParams}
      filterItems={[recurringBillsFilter]}
      callToActions={[<BillsInboxControl key={BillsInboxControl.name} />]}
      Charts={GridApiCharts}
    />
  )
}
