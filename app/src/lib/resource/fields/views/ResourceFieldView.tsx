'use client'

import { Link } from '@mui/material'
import { ValueResource } from '@supplyside/model'
import NextLink from 'next/link'

type Props = {
  resource: ValueResource
}

export default function ResourceFieldView({ resource }: Props) {
  const shouldRedirectToDetailPage = ['Bill', 'Job', 'Purchase'].includes(
    resource.type,
  )

  return (
    <Link
      component={NextLink}
      href={
        shouldRedirectToDetailPage
          ? `/${resource.type.toLowerCase()}s/${resource.key}`
          : `${window.location.pathname}?drawerResourceId=${resource.id}`
      }
      scroll={false}
    >
      {resource.name ?? '-'}
    </Link>
  )
}
