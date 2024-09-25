'use server'

import { ResourceType } from '@prisma/client'
import { notFound, redirect } from 'next/navigation'
import { requireSessionWithRedirect, withSession } from '@/lib/session/actions'
import { readResource } from '@/domain/resource'
import { readSchema } from '@/domain/schema'
import { Session } from '@/domain/session/entity'
import { Resource } from '@/domain/resource/entity'
import { Schema } from '@/domain/schema/entity'
import { cloneResource as domainCloneResource } from '@/domain/resource/clone'

type DetailPageModel = {
  session: Session
  resource: Resource
  schema: Schema
  lineSchema: Schema
}

export const readDetailPageModel = async (
  resourceType: ResourceType,
  rawKey: unknown,
  path: string,
): Promise<DetailPageModel> => {
  const key = Number(rawKey)

  if (isNaN(key)) notFound()

  const session = await requireSessionWithRedirect(path)

  const [resource, schema, lineSchema] = await Promise.all([
    readResource({
      accountId: session.accountId,
      type: resourceType,
      key,
    }).catch(() => null),
    readSchema({
      accountId: session.accountId,
      resourceType,
    }),
    readSchema({
      accountId: session.accountId,
      resourceType: 'Line',
    }),
  ])

  if (!resource) notFound()

  return { session, resource, schema, lineSchema }
}

export const cloneResource = async (resourceId: string) =>
  await withSession(async ({ accountId }) => {
    const resource = await domainCloneResource(accountId, resourceId)

    redirect(`/${resource.type.toLowerCase()}s/${resource.key}?cloned`)
  })
