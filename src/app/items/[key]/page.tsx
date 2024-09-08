import { selectResourceField } from '@/domain/resource/types'
import { fields } from '@/domain/schema/template/system-fields'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'

export default async function ItemsDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { resource, schema } = await readDetailPageModel(
    'Item',
    key,
    `/items/${key}`,
  )

  return (
    <ResourceDetailPage
      schema={schema}
      resource={resource}
      tools={[]}
      name={selectResourceField(resource, fields.name)?.string}
    />
  )
}
