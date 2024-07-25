'use server'

import assert, { fail } from 'assert'
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
import dynamic from 'next/dynamic'
import { readSchema } from '../schema/actions'
import ReadonlyTextarea from './fields/ReadonlyTextarea'
import { Resource } from '@/domain/resource/types'

const Field = dynamic(() => import('./fields/Field'))

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
          <Stack direction={'row'} spacing={5} overflow={'hidden'}>
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
                                ({ value: { resource } }) =>
                                  resource?.key ?? '-',
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
                        <Typography variant="overline" gutterBottom>
                          {f.name}
                        </Typography>
                        <Box>
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
  assert(n > 0)
  const m = Math.floor(arr.length / n)
  const r = arr.length % n
  return range(0, n).map((i) =>
    arr.slice(i * m + Math.min(i, r), (i + 1) * m + Math.min(i + 1, r)),
  )
}
