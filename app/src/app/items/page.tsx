import ListPage from '@/lib/resource/ListPage'

export default async function Items({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  return (
    <ListPage
      tableKey="itemsList"
      resourceType="Item"
      searchParams={searchParams}
    />
  )
}
