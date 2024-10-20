import ListPage from '@/lib/resource/ListPage'

export default async function WorkCentersPage({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  return (
    <ListPage
      tableKey="workcentersList"
      resourceType="WorkCenter"
      searchParams={searchParams}
    />
  )
}
