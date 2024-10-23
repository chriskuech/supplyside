import { BillsInboxControl } from './BillsInboxControl'
import ListPage from '@/lib/resource/ListPage'

export default async function Bills({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  return (
    <ListPage
      tableKey="billsList"
      resourceType="Bill"
      searchParams={searchParams}
      callToActions={[<BillsInboxControl key={BillsInboxControl.name} />]}
    />
  )
}
