import { fields, selectResourceFieldValue } from '@supplyside/model'
import { ToggleControl } from './tools/ToggleControl'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'

export default async function ScheduledDetailPage({
  params: { key },
  searchParams,
}: {
  params: { key: string }
  searchParams: Record<string, unknown>
}) {
  const { resource, schema } = await readDetailPageModel(
    'PurchaseSchedule',
    key,
  )

  const isRunning =
    selectResourceFieldValue(resource, fields.running)?.boolean ?? false

  return (
    <ResourceDetailPage
      path={[
        {
          label: 'Purchase Schedules',
          href: '/purchases/schedules',
        },
        {
          label: resource.key.toString(),
          href: `/purchases/schedules/${resource.key}`,
        },
      ]}
      schema={schema}
      resource={resource}
      searchParams={searchParams}
      tools={(fontSize) => [
        <ToggleControl
          key={ToggleControl.name}
          resource={resource}
          schema={schema}
          fontSize={fontSize}
        />,
      ]}
      linkedResources={[
        {
          resourceType: 'Purchase',
          backlinkField: fields.purchaseSchedule,
          disableCreate: true,
        },
      ]}
      isReadOnly={isRunning}
    />
  )
}
