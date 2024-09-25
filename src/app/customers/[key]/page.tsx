import { selectResourceFieldValue } from '@/domain/resource/extensions'
import { fields } from '@/domain/schema/template/system-fields'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'

export default async function CustomersDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { resource, schema, lineSchema } = await readDetailPageModel(
    'Customer',
    key,
    `/customers/${key}`,
  )

  return (
    <ResourceDetailPage
      lineSchema={lineSchema}
      schema={schema}
      resource={resource}
      tools={[]}
      name={selectResourceFieldValue(resource, fields.name)?.string}
    />
  )
}
