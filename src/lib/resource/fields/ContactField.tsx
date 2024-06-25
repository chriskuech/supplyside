'use client'

import { Badge, Email, Person, Phone } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material'
import { Contact } from '@prisma/client'
import { FC, useEffect, useState } from 'react'
import ContactCard from './ContactCard'
import { UpdateContactDto } from '@/domain/resource/fields/actions'

export type ContactFieldProps = {
  contact: Contact | null
  onChange: (contact: UpdateContactDto | null) => void
}

export default function ContactField({ contact, onChange }: ContactFieldProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Dialog onClose={() => setIsOpen(false)} open={isOpen}>
        <DialogTitle>Edit Contact</DialogTitle>
        <DialogContent>
          <ContactForm
            contact={contact}
            onChange={(dto) => {
              setIsOpen(false)
              onChange(dto)
            }}
            onCancel={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
      {contact ? (
        <Stack spacing={1}>
          <ContactCard contact={contact} />
          <Stack spacing={1} direction={'row'} justifyContent={'end'}>
            <Button onClick={() => setIsOpen(true)}>Edit</Button>
            <Button onClick={() => onChange(null)}>Remove</Button>
          </Stack>
        </Stack>
      ) : (
        <Button onClick={() => setIsOpen(true)}>Add Contact</Button>
      )}
    </>
  )
}

type ContactFormProps = {
  contact: Contact | null
  onChange: (dto: UpdateContactDto | null) => void
  onCancel: () => void
}

const ContactForm: FC<ContactFormProps> = ({ contact, onChange, onCancel }) => {
  const [dto, setDto] = useState<UpdateContactDto>({})

  useEffect(
    () =>
      setDto({
        email: contact?.email ?? '',
        name: contact?.name ?? '',
        phone: contact?.phone ?? '',
        title: contact?.title ?? '',
      }),
    [contact],
  )
  return (
    <Stack spacing={2} pt={2}>
      <TextField
        label="Name"
        defaultValue={contact?.name}
        onChange={({ target: { value: name } }) =>
          setDto((prev) => ({ ...prev, name }))
        }
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Person />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Title"
        defaultValue={contact?.title}
        onChange={({ target: { value: title } }) =>
          setDto((prev) => ({ ...prev, title }))
        }
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Badge />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Email"
        defaultValue={contact?.email}
        onChange={({ target: { value } }) =>
          setDto((prev) => ({ ...prev, email: value }))
        }
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Phone"
        defaultValue={contact?.phone}
        onChange={({ target: { value } }) =>
          setDto((prev) => ({ ...prev, name: value }))
        }
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Phone />
            </InputAdornment>
          ),
        }}
      />
      <Stack spacing={1} direction={'row'} justifyContent={'end'}>
        <Button size="small" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="small" onClick={() => onChange(dto)} variant="contained">
          Save
        </Button>
      </Stack>
    </Stack>
  )
}
