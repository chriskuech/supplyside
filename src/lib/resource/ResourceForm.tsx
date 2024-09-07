'use client'

import { fail } from 'assert'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import FieldControl from './fields/FieldControl'
import { chunkByN } from './chunkByN'
import ReadOnlyFieldsView from './fields/views/ReadOnlyFieldsView'
import Field from './fields/controls/Field'
import { Schema } from '@/domain/schema/types'
import {
  Resource,
  selectResourceField,
  setResourceField,
} from '@/domain/resource/types'

type Props = {
  schema: Schema
  resource: Resource
  onChange: (resource: Resource) => void
  isReadOnly?: boolean
  singleColumn?: boolean
}

export default function ResourceForm({
  schema,
  resource,
  isReadOnly,
  singleColumn,
}: Props) {
  const columns = singleColumn ? 1 : 3

  if (isReadOnly) {
    return <ReadOnlyFieldsView schema={schema} resource={resource} />
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
              <Typography variant="h6" fontWeight="bold">
                {s.name}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {singleField ? (
                <Box>
                  {singleField.name !== s.name && (
                    <Typography variant="overline" gutterBottom>
                      {singleField.name}{' '}
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
                  <Typography variant="caption">
                    {singleField.description}
                  </Typography>
                  <FieldControl
                    inputId={`rf-${singleField.id}`}
                    resourceId={resource.id}
                    field={singleField ?? fail()}
                    value={selectResourceField(resource, {
                      fieldId: singleField.id,
                    })}
                  />
                </Box>
              ) : (
                <Stack spacing={3} direction="row">
                  {chunkByN(s.fields, columns).map((fs, i) => (
                    <Stack key={i} spacing={3} flex={1}>
                      {fs.map((f) => (
                        <Stack key={f.id}>
                          <Typography
                            variant="overline"
                            fontSize={14}
                            lineHeight="unset"
                          >
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
                          <Typography variant="caption" gutterBottom>
                            {f.description}
                          </Typography>
                          <Box>
                            <Field
                              inputId={`rf-${f.id}`}
                              resourceId={resource.id}
                              field={f}
                              value={selectResourceField(resource, {
                                fieldId: f.id,
                              })}
                              onChange={(value) =>
                                setResourceField(resource, f, value)
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
