'use server'

import { redirect } from 'next/navigation'
import { ResourceType } from '@prisma/client'
import { allValues } from '@/lib/allValues'
import { Schema } from '@/domain/schema/types'
import { Resource } from '@/domain/resource/types'
import { readSchema } from '@/domain/schema/actions'
import { readAndExtendSession } from '@/lib/iam/actions'
import { Session } from '@/domain/iam/session/types'
import { readResource } from '@/domain/resource/actions'

export type PageModelProps = {
  session: Session
  schema: Schema
  resource: Resource
}

export type RouteProps = {
  params: Record<string, string | undefined>
}

export type ReadDetailPageModelProps = {
  resourceType: ResourceType
  pageProps: RouteProps
}

export const readDetailPageModel = async ({
  resourceType,
  pageProps,
}: ReadDetailPageModelProps): Promise<PageModelProps> => {
  const key = Number(pageProps.params.key)

  if (isNaN(key)) redirect('/404')

  const session = await readAndExtendSession()

  const state = await allValues({
    schema: readSchema({ accountId: session.account.id, resourceType }),
    resource: readResource({
      accountId: session.account.id,
      type: resourceType,
      key,
    }),
  }).catch(() => null)

  if (!state) redirect('/404')

  return { ...state, session }
}
