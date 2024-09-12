import 'server-only'
import { ResourceType } from '@prisma/client'
import { FieldRef } from '../schema/extensions'
import { cloneCosts } from './clone'
import { copyFields } from './copy'
import { readResource } from '.'

type LinkResourceParams = {
  accountId: string
  fromResourceId: string
  toResourceId: string
  backLinkFieldRef: FieldRef
}

export const linkResource = async ({
  accountId,
  fromResourceId,
  toResourceId,
  backLinkFieldRef,
}: LinkResourceParams & { backLinkFieldRef: FieldRef }) => {
  const [fromResource, toResource] = await Promise.all([
    readResource({
      accountId,
      id: fromResourceId,
    }),
    readResource({
      accountId,
      id: toResourceId,
    }),
  ])

  await copyFields({ accountId, fromResourceId, toResourceId })

  const typesWithLines: ResourceType[] = ['Order', 'Bill']
  if (
    [fromResource.type, toResource.type].every((t) =>
      typesWithLines.includes(t),
    )
  ) {
    await cloneCosts({ accountId, fromResourceId, toResourceId })
    await linkLines({
      accountId,
      fromResourceId,
      toResourceId,
      backLinkFieldRef,
    })
  }
}

const linkLines = async ({
  accountId,
  fromResourceId,
  toResourceId,
  backLinkFieldRef,
}: LinkResourceParams) => {
  throw new Error('Not implemented')
}
