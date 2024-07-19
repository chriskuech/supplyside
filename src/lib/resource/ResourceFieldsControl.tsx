'use server'

import { fail } from 'assert'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { chunk, range } from 'remeda'
import { Check, Clear, ExpandMore } from '@mui/icons-material'
import { match } from 'ts-pattern'
import { readSchema } from '../schema/actions'
import Field from './fields/Field'
import { Resource } from '@/domain/resource/types'

type Props = {
  resource: Resource
  isReadOnly?: boolean
}

export default async function ResourceFieldsControl({
  resource,
  isReadOnly,
}: Props) {
  const [systemSchema, customSchema] = await Promise.all([
    readSchema({ resourceType: resource.type, isSystem: true }),
    readSchema({ resourceType: resource.type, isSystem: false }),
  ])

  if (isReadOnly) {
    return (
      <Card variant="elevation">
        <CardContent>
          <Stack direction={'row'} spacing={5}>
            {chunkByN(
              [...systemSchema.sections, ...customSchema.sections],
              3,
            ).map((sections, i) => (
              <Stack key={i} flex={1} divider={<Divider />} spacing={2}>
                {sections.map((section) => (
                  <Stack key={section.id}>
                    <Typography variant="h6" fontWeight={'bold'}>
                      {section.name}
                    </Typography>
                    <Stack spacing={2}>
                      {section.fields.map((field) => (
                        <Stack key={field.id}>
                          <Typography variant="overline">
                            {field.name}
                          </Typography>
                          {match(
                            resource.fields.find(
                              (rf) => rf.fieldId === field.id,
                            ),
                          )
                            .with(
                              { fieldType: 'Checkbox' },
                              ({ value: { boolean } }) =>
                                boolean ? <Check /> : <Clear />,
                            )
                            .with(
                              { fieldType: 'Contact' },
                              ({ value: { contact } }) => contact?.email ?? '-', // TODO: show contact name
                            )
                            .with(
                              { fieldType: 'Date' },
                              ({ value: { date } }) =>
                                date?.toLocaleDateString() ?? '-',
                            )
                            .with(
                              { fieldType: 'File' },
                              ({ value: { file } }) => file?.name ?? '-',
                            )
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
                                  .join(' ') ?? '-',
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
                                string ? <pre>{string}</pre> : '-',
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
                              ({ value: { user } }) => user?.email ?? '-', // TODO: show user name
                            )
                            .with(
                              { fieldType: 'Resource' },
                              ({ value: { resource } }) => resource?.key ?? '-',
                            )
                            .with(undefined, () => '-')
                            .exhaustive()}
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

  return (
    <Box>
      {[...systemSchema.sections, ...customSchema.sections].map((s, i) => (
        <Accordion key={s.id} defaultExpanded={i === 0} variant="outlined">
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={'bold'}>
              {s.name}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3} direction={'row'}>
              {s.fields.length === 1 && s.fields.at(0)?.name === s.name ? (
                <Field
                  inputId={`rf-${s.fields.at(0)?.id}`}
                  resourceId={resource.id}
                  field={s.fields.at(0) ?? fail()}
                  value={
                    resource.fields.find(
                      (rf) => rf.fieldId === s.fields.at(0)?.id,
                    )?.value
                  }
                />
              ) : (
                chunkByN(s.fields, 3).map((fs, i) => (
                  <Stack key={i} spacing={3} flex={1}>
                    {fs.map((f) => (
                      <Box key={f.id}>
                        <Typography fontWeight={'bold'} gutterBottom>
                          {f.name}
                        </Typography>
                        <Field
                          inputId={`rf-${f.id}`}
                          resourceId={resource.id}
                          field={f}
                          value={
                            resource.fields.find((rf) => rf.fieldId === f.id)
                              ?.value
                          }
                        />
                      </Box>
                    ))}
                  </Stack>
                ))
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

const chunkByN = <T,>(arr: T[], n: number): T[][] => {
  const chunks = chunk(arr, Math.floor(arr.length / n))
  const fill = range(chunks.length, n).map(() => [])

  return [...chunks, ...fill]
}
