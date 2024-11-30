import { Info, Check, Clear } from '@mui/icons-material'
import { Stack, Typography, Tooltip, Box, Chip } from '@mui/material'
import { match } from 'ts-pattern'
import { Resource, Schema, SchemaData } from '@supplyside/model'
import { Masonry } from '@mui/lab'
import Linkify from 'linkify-react'
import FileField from '../fields/controls/FileField'
import FilesField from '../fields/controls/FilesField'
import ReadonlyTextarea from '../fields/views/ReadonlyTextarea'
import ResourceFieldView from '../fields/views/ResourceFieldView'
import UserCard from '../fields/views/UserCard'
import ContactCard from '../fields/views/ContactCard'
import AddressCard from '../fields/views/AddressCard'
import { formatDate } from '@/lib/format'

type Props = {
  schemaData: SchemaData
  resource: Resource
}

export default function ReadOnlyFieldsView({ schemaData, resource }: Props) {
  const schema = new Schema(schemaData)
  return (
    <Masonry columns={3} spacing={5}>
      {schemaData.sections.map((section) => (
        <Stack key={section.id}>
          <Typography variant="h6" fontWeight="bold">
            {section.name}
          </Typography>
          <Stack spacing={2}>
            {section.fields.map((field) => (
              <Stack key={field.fieldId}>
                <Tooltip title={field.description}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="overline">{field.name}</Typography>
                    {field.description && (
                      <Info color="primary" sx={{ fontSize: '0.8em' }} />
                    )}
                  </Stack>
                </Tooltip>
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
                    .with({ fieldType: 'File' }, ({ value }) => (
                      <FileField file={value.file} isReadOnly />
                    ))
                    .with({ fieldType: 'Files' }, ({ value }) => (
                      <FilesField files={value.files} isReadOnly />
                    ))
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
        </Stack>
      ))}
    </Masonry>
  )
}
