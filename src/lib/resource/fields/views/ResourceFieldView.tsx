import { Link } from '@mui/material'
import NextLink from 'next/link'
import { ValueResource } from '@/domain/resource/values/types'

type Props = {
  resource: ValueResource | null
}

export default function ResourceFieldView({ resource }: Props) {
  if (!resource) return '-'

  return (
    <Link component={NextLink} href={`/${resource.type}s/${resource.key}`}>
      {resource.name ?? '-'}
    </Link>
  )
}
