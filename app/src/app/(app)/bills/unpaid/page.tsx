import { fail } from 'assert'
import { billStatusOptions, fields, Schema } from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import { BillsInboxControl } from '../BillsInboxControl'
import GridApiCharts from '../charts/GridApiCharts'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function UnpaidBills({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const billSchemaData =
    (await readSchema('Bill')) ?? fail('Bill schema not found')
  const billSchema = new Schema(billSchemaData)

  const billStatusField = billSchema.getField(fields.billStatus)
  const billStatusPaidOptionId = billSchema.getFieldOption(
    fields.billStatus,
    billStatusOptions.paid,
  ).id
  const billStatusCanceledOptionId = billSchema.getFieldOption(
    fields.billStatus,
    billStatusOptions.canceled,
  ).id

  const unpaidBillsFilter: GridFilterItem = {
    field: billStatusField.fieldId,
    operator: 'isAnyOf',
    value: billStatusField.options
      .filter(
        (option) =>
          ![billStatusPaidOptionId, billStatusCanceledOptionId].includes(
            option.id,
          ),
      )
      .map((option) => option.id),
  }
  const billRecurringField = billSchema.getField(fields.recurring)

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
      filterItems={[unpaidBillsFilter, recurringBillsFilter]}
      title="Unpaid Bills"
      callToActions={[<BillsInboxControl key={BillsInboxControl.name} />]}
      Charts={GridApiCharts}
    />
  )
}
