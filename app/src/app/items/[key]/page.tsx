import { fields, selectResourceFieldValue } from '@supplyside/model'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'

export default async function ItemsDetail({
  params: { key },
  searchParams,
}: {
  params: { key: string }
  searchParams: { [key: string]: unknown }
}) {
  const { resource, schema, lineSchema } = await readDetailPageModel(
    'Item',
    key,
  )

  return (
    <ResourceDetailPage
      lineSchema={lineSchema}
      schema={schema}
      resource={resource}
      searchParams={searchParams}
      tools={[]}
      name={selectResourceFieldValue(resource, fields.name)?.string}
    />
  )
}
