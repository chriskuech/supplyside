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
  Tooltip,
  Typography,
} from '@mui/material'
import { range } from 'remeda'
import { Check, Clear, ExpandMore, Info } from '@mui/icons-material'
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
                          <Tooltip title={field.description}>
                            <Typography variant="overline">
                              {field.name}{' '}
                              {field.description && (
                                <Info color="info" fontSize={'small'} />
                              )}
                            </Typography>
                          </Tooltip>
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
      {schema.sections.map((s, i) => {
        const singleField =
          s.fields.length === 1 && s.fields.at(0)?.type === 'Textarea'
            ? s.fields.at(0)
            : null

        return (
          <Accordion key={s.id} defaultExpanded={i === 0} variant="outlined">
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" fontWeight={'bold'}>
                {s.name}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {singleField ? (
                <Box>
                  {singleField.name !== s.name && (
                    <Typography variant="overline" gutterBottom>
                      {singleField.name}
                    </Typography>
                  )}
                  <Typography variant="caption">
                    {singleField.description}
                  </Typography>
                  <FieldControl
                    inputId={`rf-${singleField.id}`}
                    resourceId={resource.id}
                    field={singleField ?? fail()}
                    value={
                      resource.fields.find(
                        (rf) => rf.fieldId === singleField.id,
                      )?.value
                    }
                  />
                </Box>
              ) : (
                <Stack spacing={3} direction={'row'}>
                  {chunkByN(s.fields, columns).map((fs, i) => (
                    <Stack key={i} spacing={3} flex={1}>
                      {fs.map((f) => (
                        <Stack key={f.id}>
                          <Typography
                            variant="overline"
                            fontSize={14}
                            lineHeight={'unset'}
                          >
                            {f.name}
                          </Typography>
                          <Typography variant="caption" gutterBottom>
                            {f.description}
                          </Typography>
                          <Box>
                            <FieldControl
                              inputId={`rf-${f.id}`}
                              resourceId={resource.id}
                              field={f}
                              value={
                                resource.fields.find(
                                  (rf) => rf.fieldId === f.id,
                                )?.value
                              }
                            />
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  ))}
                </Stack>
              )}
            </AccordionDetails>
          </Accordion>
        )
      })}
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
