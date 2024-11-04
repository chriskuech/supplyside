import { ListItem, ListItemButton, ListItemText } from '@mui/material'
import Link from 'next/link'
import { ReactNode } from 'react'

type Props = {
  primaryText: ReactNode
  secondaryText?: ReactNode
  href: string
}

export default async function ResourceListItem({
  primaryText,
  secondaryText,
  href,
}: Props) {
  return (
    <ListItem disablePadding>
      <ListItemButton LinkComponent={Link} href={href}>
        <ListItemText primary={primaryText} secondary={secondaryText} />
      </ListItemButton>
    </ListItem>
  )
}
