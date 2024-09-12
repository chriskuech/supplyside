'use server'

import { ResourceType } from '@prisma/client'
import { notFound, redirect } from 'next/navigation'
import { requireSessionWithRedirect, withSession } from '@/lib/session/actions'
import { createResource, readResource } from '@/domain/resource'
import { readSchema } from '@/domain/schema'
import { Session } from '@/domain/iam/session/entity'
import { Resource } from '@/domain/resource/entity'
import { Schema } from '@/domain/schema/entity'
import { mapValueToValueInput } from '@/domain/resource/mappers'
import { copyResourceCosts } from '@/domain/resource/costs'
import { fields } from '@/domain/schema/template/system-fields'
import { copyLines } from '@/domain/resource/extensions'

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
  withSession(async ({ accountId }) => {
    const source = await readResource({ accountId, id: resourceId })

    const destination = await createResource({
      accountId,
      type: source.type,
      fields: source.fields.map(({ fieldId, fieldType, value }) => ({
        fieldId,
        value: mapValueToValueInput(fieldType, value),
      })),
    })

    if (source.type === 'Order') {
      await Promise.all([
        copyLines(accountId, source.id, destination.id, fields.order),
        copyResourceCosts(source.id, destination.id),
      ])
    }

    if (source.type === 'Bill') {
      await Promise.all([
        copyLines(accountId, source.id, destination.id, fields.bill),
        copyResourceCosts(source.id, destination.id),
      ])
    }

    redirect(`/${destination.type.toLowerCase()}s/${destination.key}`)
  })
