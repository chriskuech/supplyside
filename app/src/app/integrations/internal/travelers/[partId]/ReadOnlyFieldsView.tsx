'use client'

import { Check, Clear } from '@mui/icons-material'
import { Stack, Box, Chip } from '@mui/material'
import { match } from 'ts-pattern'
import { Resource, Schema, SchemaData } from '@supplyside/model'
import { Masonry } from '@mui/lab'
import Linkify from 'linkify-react'
import { formatDate } from '@/lib/format'
import AddressCard from '@/lib/resource/fields/views/AddressCard'
import ContactCard from '@/lib/resource/fields/views/ContactCard'
import ReadonlyTextarea from '@/lib/resource/fields/views/ReadonlyTextarea'
import UserCard from '@/lib/resource/fields/views/UserCard'
import ResourceFieldView from '@/lib/resource/fields/views/ResourceFieldView'

type Props = {
  schemaData: SchemaData
  resource: Resource
}

export default function ReadOnlyFieldsView({ schemaData, resource }: Props) {
  const schema = new Schema(schemaData)
  return (
    <Masonry columns={3} spacing={2}>
      {schemaData.sections.map((section) => (
        <Box key={section.id} border="1px solid black">
          <Box
            bgcolor="lightgray"
            color="black"
            px={1}
            py={0.5}
            fontWeight="bold"
            borderBottom="1px solid black"
            sx={{
              '@media print': {
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact',
              },
            }}
          >
            {section.name}
          </Box>
          <Stack px={1}>
            {section.fields.map((field) => (
              <Stack
                direction="row"
                key={field.fieldId}
                justifyContent="space-between"
                alignItems="center"
              >
                <Box fontWeight="bold">{field.name}</Box>
                <Box>
                  {match(
                    resource.fields.find((rf) => rf.fieldId === field.fieldId),
                  )
                    .with({ fieldType: 'Address' }, ({ value }) =>
                      value.address ? (
                        <AddressCard address={value.address} />
                      ) : (
                        '-'
                      ),
                    )
                    .with(
                      { fieldType: 'Checkbox' },
                      ({ value: { boolean } }) =>
                        boolean ? <Check /> : <Clear />,
                    )
                    .with({ fieldType: 'Contact' }, ({ value: { contact } }) =>
                      contact ? <ContactCard contact={contact} /> : '-',
                    )
                    .with({ fieldType: 'Date' }, ({ value: { date } }) =>
                      date ? formatDate(date) : '-',
                    )
                    .with({ fieldType: 'File' }, ({ value }) =>
                      value.file ? value.file.name : '-',
                    )
                    .with(
                      { fieldType: 'Files' },
                      ({ value }) => value.files.length || '',
                    )
                    .with({ fieldType: 'Money' }, ({ value: { number } }) =>
                      number?.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }),
                    )
                    .with(
                      { fieldType: 'MultiSelect' },
                      ({ value: { options } }) =>
                        options
                          .map((o) => <Chip key={o.id} label={o.name} />)
                          .join(' ') || '-',
                    )
                    .with(
                      { fieldType: 'Number' },
                      ({ templateId, value: { number } }) => {
                        if (number === null) return '-'

                        const prefix =
                          templateId &&
                          schema.getField({ templateId }).template?.prefix

                        return prefix ? `${prefix} ${number}` : number
                      },
                    )
                    .with({ fieldType: 'Text' }, ({ value: { string } }) => (
                      <Linkify options={{ target: '_blank' }}>
                        {string || '-'}
                      </Linkify>
                    ))
                    .with({ fieldType: 'Textarea' }, ({ value: { string } }) =>
                      string ? <ReadonlyTextarea value={string} /> : '-',
                    )
                    .with({ fieldType: 'Select' }, ({ value: { option } }) =>
                      option?.name ? <Chip label={option.name} /> : '-',
                    )
                    .with({ fieldType: 'User' }, ({ value: { user } }) => (
                      <UserCard user={user} />
                    ))
                    .with(
                      { fieldType: 'Resource' },
                      ({ value: { resource } }) =>
                        resource ? (
                          <ResourceFieldView resource={resource} />
                        ) : (
                          '-'
                        ),
                    )
                    .with(undefined, () => '-')
                    .exhaustive()}
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      ))}
    </Masonry>
  )
}
