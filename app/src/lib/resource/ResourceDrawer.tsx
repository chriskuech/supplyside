import { RedirectType, redirect } from 'next/navigation'
import { z } from 'zod'
import { match } from 'ts-pattern'
import { fields, selectResourceFieldValue } from '@supplyside/model'
import QuickBooksLink from '../quickBooks/QuickBooksLink'
import { WorkCenterOperations } from '../workcenter/WorkCenterOperations'
import { ResourceDrawerView } from './ResourceDrawerView'
import { CompareModal } from './CompareModal'
import { readResource } from '@/actions/resource'
import { readSchema } from '@/actions/schema'
import { getCustomerUrl, getVendorUrl } from '@/lib/quickBooks/helpers'

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
    <>
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
                fontSize="large"
                key={QuickBooksLink.name}
                quickBooksAppUrl={getVendorUrl(quickBooksVendorId)}
              />,
            ]
          })
          .with({ type: 'Customer' }, (resource) => {
            const quickBooksCustomerId = selectResourceFieldValue(
              resource,
              fields.quickBooksCustomerId,
            )?.string

            if (!quickBooksCustomerId) return []

            return [
              <QuickBooksLink
                fontSize="large"
                key={QuickBooksLink.name}
                quickBooksAppUrl={getCustomerUrl(quickBooksCustomerId)}
              />,
            ]
          })
          .otherwise(() => [])}
        onClose={close}
      >
        {resource?.type === 'WorkCenter' && (
          <WorkCenterOperations workCenterId={resource.id} />
        )}
      </ResourceDrawerView>
      {resource && schema && (
        <CompareModal
          resource={resource}
          schemaData={schema}
          searchParams={searchParams}
        />
      )}
    </>
  )
}
