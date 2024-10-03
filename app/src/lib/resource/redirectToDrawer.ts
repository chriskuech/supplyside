import { ResourceType } from '@supplyside/model'
import { RedirectType, notFound, redirect } from 'next/navigation'
import { requireSession } from '@/session'
import 'server-only'
import { resolveKey } from '@/client/resource'

export const redirectToDrawer = async (
  resourceType: ResourceType,
  resourceKey: string,
) => {
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
