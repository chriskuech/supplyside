import ListPage from '@/lib/resource/ListPage'

export default async function Lines({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  return (
    <ListPage
      tableKey="linesList"
      resourceType="Line"
      searchParams={searchParams}
    />
  )
}
