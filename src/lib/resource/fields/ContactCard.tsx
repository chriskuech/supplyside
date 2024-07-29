import { Badge, Person, Email, Phone, Visibility } from '@mui/icons-material'
import {
  Card,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  Typography,
  Stack,
  Dialog,
  IconButton,
} from '@mui/material'
import { Contact } from '@prisma/client'
import { useState } from 'react'

type Props = {
  contact: Contact
  inline?: boolean
}

function FullContactCard({ contact }: Props) {
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

function InlineContact({ contact }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <FullContactCard contact={contact} />
      </Dialog>
      <Card variant="outlined">
        <Stack direction="row" paddingX={1} alignItems="center" spacing={1}>
          <Person />
          <Typography flexGrow={1}>{contact.name}</Typography>
          <IconButton
            style={{ justifySelf: 'flex-end' }}
            onClick={() => setIsOpen(true)}
          >
            <Visibility />
          </IconButton>
        </Stack>
      </Card>
    </>
  )
}

export default function ContactCard(props: Props) {
  return props.inline ? (
    <InlineContact {...props} />
  ) : (
    <FullContactCard {...props} />
  )
}
