import { Link } from '@mui/material'
import NextLink from 'next/link'
import { ValueResource } from '@/domain/resource/entity'

type Props = {
  resource: ValueResource
}

export default function ResourceFieldView({ resource }: Props) {
  return (
    <Link
      component={NextLink}
      href={`/${resource.type.toLowerCase()}s/${resource.key}`}
    >
      {resource.name ?? '-'}
    </Link>
  )
}
