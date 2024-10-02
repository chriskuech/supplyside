import { RedirectType, redirect } from 'next/navigation'
import { z } from 'zod'
import { ResourceDrawerView } from './ResourceDrawerView'
import { readResource } from '@/actions/resource'
import { readSchema } from '@/actions/schema'

type ResourceFieldDrawerProps = {
  searchParams: Record<string, unknown>
}

export const ResourceDrawer = async ({
  searchParams,
}: ResourceFieldDrawerProps) => {
  const resourceId = z
    .string()
    .uuid()
    .safeParse(searchParams.drawerResourceId).data
  const resource = resourceId ? await readResource(resourceId) : null
  const schema = resource ? await readSchema(resource.type) : null

  async function close(path: string) {
    'use server'

    redirect(path, RedirectType.replace)
  }

  return (
    <ResourceDrawerView
      state={schema && resource ? { schema, resource } : undefined}
      onClose={close}
    />
  )
}
