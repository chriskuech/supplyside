import { Badge, Person, Email, Phone } from '@mui/icons-material'
import {
  Card,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
} from '@mui/material'
import { Contact } from '@prisma/client'

type Props = {
  contact: Contact
}

export default function ContactCard({ contact }: Props) {
  return (
    <Card variant="outlined">
      <List disablePadding dense>
        <ListItem>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText
            primary={contact?.name}
            secondary={!contact?.name && 'Name'}
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Badge />
          </ListItemIcon>
          <ListItemText
            primary={contact?.title}
            secondary={!contact?.title && 'Title'}
          />
        </ListItem>
        <ListItemButton
          disabled={!contact?.email}
          component={'a'}
          href={contact.email ? `mailto:${contact.email}` : undefined}
        >
          <ListItemIcon>
            <Email />
          </ListItemIcon>
          <ListItemText
            primary={contact?.email}
            secondary={!contact?.email && 'Email'}
          />
        </ListItemButton>
        <ListItemButton
          disabled={!contact?.phone}
          component={'a'}
          href={contact.phone ? `tel:${contact.phone}` : undefined}
        >
          <ListItemIcon>
            <Phone />
          </ListItemIcon>
          <ListItemText
            primary={contact?.phone}
            secondary={!contact?.phone && 'Phone'}
          />
        </ListItemButton>
      </List>
    </Card>
  )
}
