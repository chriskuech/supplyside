import ListPage from '@/lib/resource/ListPage'

export default async function Vendors({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  return (
    <ListPage
      tableKey="vendorsList"
      resourceType="Vendor"
      searchParams={searchParams}
    />
  )
}
