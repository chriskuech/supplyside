import { container } from 'tsyringe'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'
import { selectResourceFieldValue } from '@/domain/resource/extensions'
import { fields } from '@/domain/schema/template/system-fields'
import QuickBooksLink from '@/lib/quickBooks/QuickBooksLink'
import { QuickBooksService } from '@/integrations/quickBooks'

export default async function VendorDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const quickBooksService = container.resolve(QuickBooksService)

  const { resource, schema, lineSchema } = await readDetailPageModel(
    'Vendor',
    key,
    `/vendors/${key}`,
  )

  const name = selectResourceFieldValue(resource, fields.name)?.string
  const quickBooksVendorId = selectResourceFieldValue(
    resource,
    fields.quickBooksVendorId,
  )?.string

  const quickBooksAppUrl = quickBooksVendorId
    ? quickBooksService.getVendorUrl(quickBooksVendorId)
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
    />
  )
}
