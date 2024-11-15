'use server'

import { fail } from 'assert'
import { Resource, ResourceType, SchemaData, User } from '@supplyside/model'
import { notFound, redirect } from 'next/navigation'
import { match } from 'ts-pattern'
import { Session, requireSession } from '@/session'
import {
  readResource,
  cloneResource as clientCloneResource,
  resolveKey,
} from '@/client/resource'
import { readSchema } from '@/client/schema'
import { readSelf } from '@/client/user'
import { Account, readAccount } from '@/client/account'

type DetailPageModel = {
  session: Session
  resource: Resource
  schemaData: SchemaData
  lineSchema: SchemaData | null
  account: Account
  user: User
}

export const readDetailPageModel = async (
  resourceType: ResourceType,
  rawKey: unknown,
): Promise<DetailPageModel> => {
  const key = Number(rawKey)

  if (isNaN(key)) notFound()

  const session = await requireSession()

  const resourceId = await resolveKey(session.accountId, resourceType, key)
    .then((r) => r?.id)
    .catch(() => null)

  if (!resourceId) notFound()

  const lineResourceType = match<ResourceType, ResourceType | null>(
    resourceType,
  )
    .with('Bill', () => 'PurchaseLine')
    .with('Job', () => 'Part')
    .with('Purchase', () => 'PurchaseLine')
    .otherwise(() => null)

  const [resource, schemaData, lineSchema, account, user] = await Promise.all([
    readResource(session.accountId, resourceId).then((e) => e ?? fail()),
    readSchema(session.accountId, resourceType).then((e) => e ?? fail()),
    lineResourceType &&
      readSchema(session.accountId, lineResourceType).then((e) => e ?? fail()),
    readAccount(session.accountId).then((e) => e ?? fail()),
    readSelf(session.userId).then((e) => e ?? fail()),
  ])

  return { session, resource, schemaData, lineSchema, account, user }
}

export const cloneResource = async (resourceId: string) => {
  const { accountId } = await requireSession()
  const resource = await clientCloneResource(accountId, resourceId)

  if (!resource) return

  redirect(`/${resource.type.toLowerCase()}s/${resource.key}?cloned`)
}
