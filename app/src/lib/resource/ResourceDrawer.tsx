import { RedirectType, redirect } from 'next/navigation'
import { z } from 'zod'
import { match } from 'ts-pattern'
import { fields, selectResourceFieldValue } from '@supplyside/model'
import QuickBooksLink from '../quickBooks/QuickBooksLink'
import { ResourceDrawerView } from './ResourceDrawerView'
import { readResource } from '@/actions/resource'
import { readSchema } from '@/actions/schema'
import { getVendorUrl } from '@/lib/quickBooks/helpers'

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
      tools={match(resource)
        .with({ type: 'Vendor' }, (resource) => {
          const quickBooksVendorId = selectResourceFieldValue(
            resource,
            fields.quickBooksVendorId,
          )?.string

          if (!quickBooksVendorId) return []

          return [
            <QuickBooksLink
              key={QuickBooksLink.name}
              quickBooksAppUrl={getVendorUrl(quickBooksVendorId)}
            />,
          ]
        })
        .otherwise(() => [])}
      onClose={close}
    />
  )
}
