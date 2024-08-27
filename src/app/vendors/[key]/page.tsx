import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'
import { selectValue } from '@/domain/resource/types'
import { fields } from '@/domain/schema/template/system-fields'

export default async function VendorDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { resource, schema } = await readDetailPageModel('Vendor', key)

  const name = selectValue(resource, fields.name)?.string

  return (
    <ResourceDetailPage
      schema={schema}
      resource={resource}
      name={name}
      tools={[]}
    />
  )
}
