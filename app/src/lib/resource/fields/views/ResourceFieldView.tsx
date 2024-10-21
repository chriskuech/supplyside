'use client'

import { Link } from '@mui/material'
import { MCMASTER_CARR_NAME, resources, ValueResource } from '@supplyside/model'
import NextLink from 'next/link'
import { McMasterCarrLogo } from '@/lib/ux/McMasterCarrLogo'

type Props = {
  resource: ValueResource
}

export default function ResourceFieldView({ resource }: Props) {
  const shouldRedirectToDetailPage = ['Bill', 'Job', 'Purchase'].includes(
    resource.type,
  )

  const isMcMasterCarr =
    resource.templateId === resources.mcMasterCarrVendor.templateId &&
    resource.name === MCMASTER_CARR_NAME

  return (
    <Link
      component={NextLink}
      href={
        shouldRedirectToDetailPage
          ? `/${resource.type.toLowerCase()}s/${resource.key}`
          : `${window.location.pathname}?drawerResourceId=${resource.id}`
      }
      scroll={false}
      sx={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: 1,
        '&:hover': {
          backgroundColor: 'background.default',
        },
      }}
    >
      {isMcMasterCarr ? <McMasterCarrLogo /> : (resource.name ?? '-')}
    </Link>
  )
}
