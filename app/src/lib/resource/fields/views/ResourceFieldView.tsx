import { Link } from '@mui/material'
import { ValueResource } from '@supplyside/model'
import NextLink from 'next/link'

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
