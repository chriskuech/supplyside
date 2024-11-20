import { resourceTypes } from '@supplyside/model'
import { notFound } from 'next/navigation'
import { ResourceTable } from '@/lib/resource/table'
import { readResources } from '@/client/resource'
import { readAccounts } from '@/client/account'
import { readSchema } from '@/client/schema'

export default async function Page({
  params: { accountKey, resourceType: resourceTypeParam },
}: {
  params: { accountKey: string; resourceType: string }
}) {
  const resourceType = resourceTypes.find(
    (rt) => rt.toLowerCase() === resourceTypeParam.toLowerCase(),
  )
  if (!resourceType) return notFound()

  const accounts = await readAccounts()
  const account = accounts?.find((a) => a.key === accountKey)
  if (!account) return notFound()

  const schema = await readSchema(account.id, resourceType)
  if (!schema) return notFound()

  const resources = await readResources(account.id, resourceType, {})
  if (!resources) return notFound()

  return <ResourceTable schemaData={schema} resources={resources} isEditable />
}
