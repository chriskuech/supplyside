import { fail } from 'assert'
import { fields, Schema } from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import { BillsInboxControl } from '../BillsInboxControl'
import GridApiCharts from '../charts/GridApiCharts'
import { readSchema } from '@/actions/schema'
import ListPage from '@/lib/resource/ListPage'
import { readResources } from '@/actions/resource'

export default async function Bills({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const billSchemaData =
    (await readSchema('Bill')) ?? fail('Bill schema not found')
  const schema = new Schema(billSchemaData)

  const recurringBillsFilter: GridFilterItem = {
    field: schema.getField(fields.recurring).fieldId,
    operator: 'is',
    value: 'false',
  }

  const recurringBills = await readResources('Bill', {
    where: {
      and: [{ '==': [{ var: fields.recurring.name }, true] }],
    },
  })

  return (
    <ListPage
      tableKey="billsList"
      title="All Bills"
      resourceType="Bill"
      searchParams={searchParams}
      filterItems={[recurringBillsFilter]}
      callToActions={[<BillsInboxControl key={BillsInboxControl.name} />]}
      Charts={GridApiCharts}
      recurringResources={recurringBills}
    />
  )
}
