import { fail } from 'assert'
import {
  billStatusOptions,
  fields,
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import { BillsInboxControl } from '../BillsInboxControl'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function ClosedBills({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const billSchema = (await readSchema('Bill')) ?? fail('Bill schema not found')

  const billStatusField = selectSchemaFieldUnsafe(billSchema, fields.billStatus)
  const billStatusPaidOptionId = selectSchemaFieldOptionUnsafe(
    billSchema,
    fields.billStatus,
    billStatusOptions.paid,
  ).id
  const billStatusCanceledOptionId = selectSchemaFieldOptionUnsafe(
    billSchema,
    fields.billStatus,
    billStatusOptions.canceled,
  ).id

  const closedBillsFilter: GridFilterItem = {
    field: billStatusField.fieldId,
    operator: 'isAnyOf',
    value: [billStatusPaidOptionId, billStatusCanceledOptionId],
  }

  return (
    <ListPage
      tableKey="billsList"
      resourceType="Bill"
      searchParams={searchParams}
      filterItems={[closedBillsFilter]}
      title="Closed Bills"
      callToActions={[<BillsInboxControl key={BillsInboxControl.name} />]}
    />
  )
}
