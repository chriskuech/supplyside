import { selectResourceField } from '@/domain/resource/extensions'
import { fields } from '@/domain/schema/template/system-fields'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'
import 'server-only'

export default async function ItemsDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { resource, schema, lineSchema } = await readDetailPageModel(
    'Item',
    key,
    `/items/${key}`,
  )

  return (
    <ResourceDetailPage
      lineSchema={lineSchema}
      schema={schema}
      resource={resource}
      tools={[]}
      name={selectResourceField(resource, fields.name)?.string}
    />
  )
}
