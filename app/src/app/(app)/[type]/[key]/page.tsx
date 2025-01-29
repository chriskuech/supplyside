import { RedirectType, notFound, redirect } from 'next/navigation'
import { resourceTypes } from '@supplyside/model'
import { requireSession } from '@/session'
import { resolveKey } from '@/client/resource'

export default async function GenericDetailPage({
  params: { type: paramsType, key: resourceKey },
}: {
  params: { type?: string; key?: string }
  searchParams: Record<string, unknown>
}) {
  const resourceType = resourceTypes.find(
    (rt) => paramsType?.replace(/s$/, '') === rt.toLowerCase(),
  )
  if (!resourceType) notFound()

  const key = Number(resourceKey)
  if (isNaN(key)) notFound()

  const { accountId } = await requireSession()
  const resource = await resolveKey(accountId, resourceType, key)

  if (!resource) notFound()

  redirect(
    `/${resourceType.toLowerCase()}s?drawerResourceId=${resource.id}`,
    RedirectType.replace,
  )
}
