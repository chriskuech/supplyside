'use client'

import { fail, ok } from 'assert'
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
import { range } from 'remeda'
import { Check, Clear, ExpandMore } from '@mui/icons-material'
import { match } from 'ts-pattern'
import ReadonlyTextarea from './fields/ReadonlyTextarea'
import ResourceField from './fields/ResourceField'
import FieldControl from './fields/FieldControl'
import { Schema } from '@/domain/schema/types'
import { Resource } from '@/domain/resource/types'

type Props = {
  schema: Schema
  resource: Resource
  isReadOnly?: boolean
  singleColumn?: boolean
}

export default function ResourceFieldsControl({
  schema,
  resource,
  isReadOnly,
  singleColumn,
}: Props) {
  const columns = singleColumn ? 1 : 3

  if (isReadOnly) {
    return (
      <Card variant="elevation">
        <CardContent>
          <Stack direction={'row'} spacing={5} overflow={'hidden'}>
            {chunkByN(schema.sections, columns).map((sections, i) => (
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
                          <Box>
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
                                ({ value: { contact } }) =>
                                  contact?.email ?? '-', // TODO: show contact name
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
                                { fieldType: 'Files' },
                                ({ value: { files } }) => {
                                  const fileNames = files?.map((f) => f.name)

                                  if (!fileNames?.length) return '-'

                                  return fileNames.join(', ')
                                },
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
                                ({ value: { user } }) => user?.email ?? '-', // TODO: show user name
                              )
                              .with(
                                { fieldType: 'Resource' },
                                ({ value: { resource } }) => (
                                  <ResourceField
                                    value={resource}
                                    resourceType={field.resourceType ?? fail()}
                                    isReadOnly
                                  />
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

  return (
    <Box>
      {schema.sections.map((s, i) => (
        <Accordion key={s.id} defaultExpanded={i === 0} variant="outlined">
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" fontWeight={'bold'}>
              {s.name}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {s.fields.length === 1 && s.fields.at(0)?.type === 'Textarea' ? (
              <Box>
                {s.fields.at(0)?.name !== s.name && (
                  <Typography variant="overline" gutterBottom>
                    {s.fields.at(0)?.name}{' '}
                    {s.fields.at(0)?.isRequired && (
                      <Typography
                        color="error"
                        display="inline"
                        variant="overline"
                        fontWeight="bold"
                      >
                        *
                      </Typography>
                    )}
                  </Typography>
                )}
                <FieldControl
                  inputId={`rf-${s.fields.at(0)?.id}`}
                  resourceId={resource.id}
                  field={s.fields.at(0) ?? fail()}
                  value={
                    resource.fields.find(
                      (rf) => rf.fieldId === s.fields.at(0)?.id,
                    )?.value
                  }
                />
              </Box>
            ) : (
              <Stack spacing={3} direction={'row'}>
                {chunkByN(s.fields, columns).map((fs, i) => (
                  <Stack key={i} spacing={3} flex={1}>
                    {fs.map((f) => (
                      <Box key={f.id}>
                        <Typography variant="overline" gutterBottom>
                          {f.name}{' '}
                          {f.isRequired && (
                            <Typography
                              color="error"
                              display="inline"
                              variant="overline"
                              fontWeight="bold"
                            >
                              *
                            </Typography>
                          )}
                        </Typography>
                        <Box>
                          <FieldControl
                            inputId={`rf-${f.id}`}
                            resourceId={resource.id}
                            field={f}
                            value={
                              resource.fields.find((rf) => rf.fieldId === f.id)
                                ?.value
                            }
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                ))}
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

/**
 * Breaks up an array into n smaller arrays such
 *  - the last arrays have m elements
 *  - the first arrays have m+1 elements
 *  - the order of elements is preserved
 * @param arr the array to break up into chunks
 * @param n the number of chunks to break the array into
 * @returns an array of arrays with the elements of the original array
 */
const chunkByN = <T,>(arr: T[], n: number): T[][] => {
  ok(n > 0)
  const m = Math.floor(arr.length / n)
  const r = arr.length % n
  return range(0, n).map((i) =>
    arr.slice(i * m + Math.min(i, r), (i + 1) * m + Math.min(i + 1, r)),
  )
}
