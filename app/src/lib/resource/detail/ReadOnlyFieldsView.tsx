import { Info, Check, Clear } from '@mui/icons-material'
import {
  Card,
  CardContent,
  Stack,
  Divider,
  Typography,
  Tooltip,
  Box,
  Chip,
} from '@mui/material'
import { match } from 'ts-pattern'
import { chunkByN } from '../chunkByN'
import FileField from '../fields/controls/FileField'
import FilesField from '../fields/controls/FilesField'
import ReadonlyTextarea from '../fields/views/ReadonlyTextarea'
import ResourceFieldView from '../fields/views/ResourceFieldView'
import UserCard from '../fields/views/UserCard'
import ContactCard from '../fields/views/ContactCard'
import AddressCard from '../fields/views/AddressCard'
import { Schema } from '@/domain/schema/entity'
import { Resource } from '@/domain/resource/entity'

type Props = {
  schema: Schema
  resource: Resource
}

export default function ReadOnlyFieldsView({ schema, resource }: Props) {
  return (
    <Card variant="elevation">
      <CardContent>
        <Stack direction="row" spacing={5} overflow="hidden">
          {chunkByN(schema.sections, 3).map((sections, i) => (
            <Stack key={i} flex={1} divider={<Divider />} spacing={2}>
              {sections.map((section) => (
                <Stack key={section.id}>
                  <Typography variant="h6" fontWeight="bold">
                    {section.name}
                  </Typography>
                  <Stack spacing={2}>
                    {section.fields.map((field) => (
                      <Stack key={field.id}>
                        <Tooltip title={field.description}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography variant="overline">
                              {field.name}
                            </Typography>
                            {field.description && (
                              <Info color="primary" fontSize="small" />
                            )}
                          </Stack>
                        </Tooltip>
                        <Box>
                          {match(
                            resource.fields.find(
                              (rf) => rf.fieldId === field.id,
                            ),
                          )
                            .with({ fieldType: 'Address' }, ({ value }) =>
                              value?.address ? (
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
                            .with(
                              { fieldType: 'Contact' },
                              ({ value: { contact } }) =>
                                contact ? (
                                  <ContactCard contact={contact} />
                                ) : (
                                  '-'
                                ),
                            )
                            .with(
                              { fieldType: 'Date' },
                              ({ value: { date } }) =>
                                date?.toLocaleDateString() ?? '-',
                            )
                            .with({ fieldType: 'File' }, ({ value }) => (
                              <FileField
                                resourceId={resource.id}
                                fieldId={field.id}
                                file={value?.file}
                                isReadOnly
                              />
                            ))
                            .with({ fieldType: 'Files' }, ({ value }) => (
                              <FilesField files={value?.files} isReadOnly />
                            ))
                            .with(
                              { fieldType: 'Money' },
                              ({ value: { number } }) =>
                                number?.toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                }),
                            )
                            .with(
                              { fieldType: 'MultiSelect' },
                              ({ value: { options } }) =>
                                options
                                  ?.map((o) => (
                                    <Chip key={o.id} label={o.name} />
                                  ))
                                  .join(' ') || '-',
                            )
                            .with(
                              { fieldType: 'Number' },
                              ({ value: { number } }) =>
                                number?.toString() ?? '-',
                            )
                            .with(
                              { fieldType: 'Text' },
                              ({ value: { string } }) => string || '-',
                            )
                            .with(
                              { fieldType: 'Textarea' },
                              ({ value: { string } }) =>
                                string ? (
                                  <ReadonlyTextarea value={string} />
                                ) : (
                                  '-'
                                ),
                            )
                            .with(
                              { fieldType: 'Select' },
                              ({ value: { option } }) =>
                                option?.name ? (
                                  <Chip label={option.name} />
                                ) : (
                                  '-'
                                ),
                            )
                            .with(
                              { fieldType: 'User' },
                              ({ value: { user } }) => <UserCard user={user} />,
                            )
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
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
