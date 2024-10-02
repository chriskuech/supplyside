import { fields } from '@supplyside/model'
import { selectResourceFieldValue } from '@supplyside/model'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'
import QuickBooksLink from '@/lib/quickBooks/QuickBooksLink'
import { getVendorUrl } from '@/client/quickBooks'

export default async function VendorDetail({
  params: { key },
  searchParams,
}: {
  params: { key: string }
  searchParams: Record<string, unknown>
}) {
  const { resource, schema, lineSchema } = await readDetailPageModel(
    'Vendor',
    key,
  )

  const name = selectResourceFieldValue(resource, fields.name)?.string
  const quickBooksVendorId = selectResourceFieldValue(
    resource,
    fields.quickBooksVendorId,
  )?.string

  const quickBooksAppUrl = quickBooksVendorId
    ? getVendorUrl(quickBooksVendorId)
    : undefined

  return (
    <ResourceDetailPage
      lineSchema={lineSchema}
      schema={schema}
      resource={resource}
      name={name}
      tools={
        quickBooksAppUrl
          ? [
              <QuickBooksLink
                key={QuickBooksLink.name}
                quickBooksAppUrl={quickBooksAppUrl}
              />,
            ]
          : []
      }
      searchParams={searchParams}
    />
  )
}
