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
import { useDisclosure } from '@/lib/hooks/useDisclosure'
import { Contact } from '@/domain/resource/entity'

type Props = {
  contact: Contact | null
  inline?: boolean
}

type ContactProp = {
  contact: Contact
}

export default function ContactCard(props: Props) {
  if (!props.contact) {
    return <Typography>No contact</Typography>
  }

  return props.inline ? (
    <InlineContact contact={props.contact} />
  ) : (
    <FullContactCard contact={props.contact} />
  )
}

function FullContactCard({ contact }: ContactProp) {
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
          component="a"
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
          component="a"
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

function InlineContact({ contact }: ContactProp) {
  const { isOpen, open, close } = useDisclosure()

  return (
    <>
      <Dialog open={isOpen} onClose={close}>
        <FullContactCard contact={contact} />
      </Dialog>
      <Card variant="outlined">
        <Stack direction="row" paddingX={1} alignItems="center" spacing={1}>
          <Person />
          <Typography flexGrow={1}>{contact.name}</Typography>
          <IconButton style={{ justifySelf: 'flex-end' }} onClick={open}>
            <Visibility />
          </IconButton>
        </Stack>
      </Card>
    </>
  )
}
