'use server'

import { ResourceType } from '@prisma/client'
import { ComponentType, ReactNode } from 'react'
import { allValues } from '../allValues'
import { Schema } from '@/domain/schema/types'
import { Resource } from '@/domain/resource/types'
import { readSchema } from '@/domain/schema/actions'
import { readSession } from '@/lib/iam/session'
import { Session } from '@/domain/iam/session'
import { readResource } from '@/domain/resource/actions'

export type PageModelProps = {
  session: Session
  schema: Schema
  resource: Resource
}

type RouteProps = {
  params: Record<string, string | undefined>
}

export const withDetailPage = (
  resourceType: ResourceType,
  Component: ComponentType<PageModelProps>,
): ComponentType<RouteProps> => {
  const WrappedComponent = async (props: RouteProps) => {
    const key = Number(props.params.key)

    if (isNaN(key)) return <NotFoundPage />

    const session = await readSession()

    const { schema, resource } = await allValues({
      schema: readSchema({ accountId: session.account.id, resourceType }),
      resource: readResource({
        accountId: session.account.id,
        type: resourceType,
        key,
      }),
    })

    return <Component session={session} schema={schema} resource={resource} />
  }

  WrappedComponent.name = `withDetailPage(${resourceType}, ${Component.name})`

  return WrappedComponent
}

// TODO
export const NotFoundPage = (): ReactNode => (
  <div>
    <h1>Not Found</h1>
  </div>
)
