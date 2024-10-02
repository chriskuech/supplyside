import { fields } from '@supplyside/model'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'

export default async function JobsDetail({
  params: { key },
  searchParams,
}: {
  params: { key: string }
  searchParams: Record<string, unknown>
}) {
  const { resource, schema, lineSchema } = await readDetailPageModel('Job', key)

  return (
    <ResourceDetailPage
      lineSchema={lineSchema}
      schema={schema}
      resource={resource}
      searchParams={searchParams}
      tools={[]}
      backlinkField={fields.job}
    />
  )
}
