'use server'

import { type ResourceType } from '@prisma/client'
import { notFound } from 'next/navigation'
import { requireSessionWithRedirect } from '@/lib/session/actions'
import { readResource } from '@/domain/resource/actions'
import { readSchema } from '@/domain/schema/actions'
import { Session } from '@/domain/iam/session/types'
import { Resource } from '@/domain/resource/types'
import { Schema } from '@/domain/schema/types'

type DetailPageModel = {
  session: Session
  resource: Resource
  schema: Schema
}

export const readDetailPageModel = async (
  resourceType: ResourceType,
  rawKey: unknown,
): Promise<DetailPageModel> => {
  const key = Number(rawKey)

  if (isNaN(key)) notFound()

  const session = await requireSessionWithRedirect()

  const [resource, schema] = await Promise.all([
    readResource({
      accountId: session.accountId,
      type: resourceType,
      key,
    }).catch(() => null),
    readSchema({
      accountId: session.accountId,
      resourceType: resourceType,
    }),
  ])

  if (!resource) notFound()

  return {
    session,
    resource,
    schema,
  }
}
