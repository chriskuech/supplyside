import ListPage from '@/lib/resource/ListPage'

export default async function Parts({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  return (
    <ListPage
      tableKey="partsList"
      resourceType="Part"
      searchParams={searchParams}
    />
  )
}
