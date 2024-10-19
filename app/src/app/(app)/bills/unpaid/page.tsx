import { fail } from 'assert'
import {
  billStatusOptions,
  fields,
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function UnpaidBills({
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

  return (
    <ListPage
      tableKey="billsList"
      resourceType="Bill"
      searchParams={searchParams}
      filterItems={[unpaidBillsFilter]}
      title="Unpaid Bills"
    />
  )
}
