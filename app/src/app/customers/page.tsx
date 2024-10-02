import ListPage from '@/lib/resource/ListPage'

export default async function Customers({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  return (
    <ListPage
      tableKey="customersList"
      resourceType="Customer"
      searchParams={searchParams}
    />
  )
}
