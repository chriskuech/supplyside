'use server'

import { ResourceType } from '@prisma/client'
import { notFound, redirect } from 'next/navigation'
import { container } from 'tsyringe'
import { requireSessionWithRedirect, withSession } from '@/lib/session/actions'
import { readResource } from '@/domain/resource'
import { Session } from '@/domain/session/entity'
import { Resource } from '@/domain/resource/entity'
import { Schema } from '@/domain/schema/entity'
import { SchemaService } from '@/domain/schema'
import { ResourceCopyService } from '@/domain/resource/clone'

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
  const schemaService = container.resolve(SchemaService)

  const key = Number(rawKey)

  if (isNaN(key)) notFound()

  const session = await requireSessionWithRedirect(path)

  const [resource, schema, lineSchema] = await Promise.all([
    readResource({
      accountId: session.accountId,
      type: resourceType,
      key,
    }).catch(() => null),
    schemaService.readSchema(session.accountId, resourceType),
    schemaService.readSchema(session.accountId, 'Line'),
  ])

  if (!resource) notFound()

  return { session, resource, schema, lineSchema }
}

export const cloneResource = async (resourceId: string) =>
  await withSession(async ({ accountId }) => {
    const cloneService = container.resolve(ResourceCopyService)

    const resource = await cloneService.cloneResource(accountId, resourceId)

    redirect(`/${resource.type.toLowerCase()}s/${resource.key}?cloned`)
  })
