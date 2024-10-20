import { fields } from '@supplyside/model'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'

export default async function WorkCenterDetail({
  params: { key },
  searchParams,
}: {
  params: { key: string }
  searchParams: Record<string, unknown>
}) {
  const { resource, schema } = await readDetailPageModel('WorkCenter', key)

  return (
    <ResourceDetailPage
      path={[
        {
          label: 'Work Centers',
          href: '/workcenters',
        },
        {
          label: resource.key.toString(),
          href: `/workcenters/${resource.key}`,
        },
      ]}
      tools={() => []}
      linkedResources={[
        {
          resourceType: 'PurchaseSchedule',
          backlinkField: fields.workCenter,
        },
        {
          resourceType: 'Purchase',
          backlinkField: fields.workCenter,
        },
      ]}
      schema={schema}
      resource={resource}
      searchParams={searchParams}
    />
  )
}
