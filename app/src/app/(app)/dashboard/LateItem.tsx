import {
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import { ResourceType } from '@supplyside/model'
import Link from 'next/link'
import { ReactNode } from 'react'

type Props = {
  primaryText: ReactNode
  secondaryText: ReactNode
  resourceType: ResourceType
  number: number
  daysLate: number
}

export default async function LateItem({
  primaryText,
  secondaryText,
  number,
  daysLate,
  resourceType,
}: Props) {
  return (
    <ListItem
      disablePadding
      secondaryAction={
        <Box textAlign="center">
          <Typography fontSize="0.5em">Days Late</Typography>
          <Typography variant="h5">{daysLate}</Typography>
        </Box>
      }
    >
      <ListItemButton
        LinkComponent={Link}
        href={`/${resourceType.toLowerCase()}s/${number}`}
      >
        <ListItemIcon>
          <Typography variant="overline">#</Typography>
          <Typography variant="h6">{number}</Typography>
        </ListItemIcon>
        <ListItemText primary={primaryText ?? '-'} secondary={secondaryText} />
      </ListItemButton>
    </ListItem>
  )
}
