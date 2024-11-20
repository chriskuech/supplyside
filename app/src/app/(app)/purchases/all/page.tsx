import ListPage from '@/lib/resource/ListPage'

export default async function Purchases({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  return (
    <ListPage
      tableKey="purchasesList"
      resourceType="Purchase"
      title="All Purchases"
      searchParams={searchParams}
    />
  )
}
