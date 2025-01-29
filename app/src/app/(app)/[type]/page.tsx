import { resourceTypes } from '@supplyside/model'
import { notFound } from 'next/navigation'
import ListPage from '@/lib/resource/ListPage'

export default async function GenericListPage({
  params: { type: paramsType },
  searchParams,
}: {
  params: { type?: string }
  searchParams: Record<string, unknown>
}) {
  const resourceType = resourceTypes.find(
    (rt) => paramsType?.replace(/s$/, '') === rt.toLowerCase(),
  )

  if (!resourceType) {
    return notFound()
  }

  return (
    <ListPage
      tableKey={`${resourceType}s-list`}
      resourceType={resourceType}
      searchParams={searchParams}
    />
  )
}
