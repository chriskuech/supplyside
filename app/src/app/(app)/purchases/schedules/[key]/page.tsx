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
      schema={schema}
      resource={resource}
      searchParams={searchParams}
      tools={[
        <ToggleControl
          key={ToggleControl.name}
          resource={resource}
          schema={schema}
        />,
      ]}
      lineSchema={null}
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
