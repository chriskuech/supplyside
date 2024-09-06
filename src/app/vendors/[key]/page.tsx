import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'
import { selectResourceField } from '@/domain/resource/types'
import { fields } from '@/domain/schema/template/system-fields'
import { getQuickBooksConfig } from '@/domain/quickBooks/util'
import QuickBooksLink from '@/lib/quickBooks/QuickBooksLink'

export default async function VendorDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { resource, schema } = await readDetailPageModel(
    'Vendor',
    key,
    `/vendors/${key}`,
  )

  const name = selectResourceField(resource, fields.name)?.string
  const quickBooksVendorId = selectResourceField(
    resource,
    fields.quickBooksVendorId,
  )?.string
  const qbConfig = getQuickBooksConfig()

  const quickBooksAppUrl =
    quickBooksVendorId && qbConfig
      ? `${qbConfig.appBaseUrl}/app/vendordetail?nameId=${quickBooksVendorId}`
      : undefined

  return (
    <ResourceDetailPage
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
