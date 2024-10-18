import ListPage from '@/lib/resource/ListPage'

export default async function JobLines({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  return (
    <ListPage
      tableKey="jobLinesList"
      resourceType="JobLine"
      searchParams={searchParams}
    />
  )
}
