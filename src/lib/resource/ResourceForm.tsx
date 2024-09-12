'use client'

import { fail } from 'assert'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { ResourceType } from '@prisma/client'
import useSchema from '../schema/useSchema'
import FieldControl from './fields/FieldControl'
import { chunkByN } from './chunkByN'
import Field from './fields/controls/Field'
import useResource from './useResource'
import { selectResourceField } from '@/domain/resource/extensions'

type Props = {
  resourceId: string
  resourceType: ResourceType
  singleColumn?: boolean
}

export default function ResourceForm({
  resourceId,
  resourceType,
  singleColumn,
}: Props) {
  const columns = singleColumn ? 1 : 3

  const schema = useSchema(resourceType)
  const [resource, setResource] = useResource(resourceId)

  if (!schema || !resource) return <CircularProgress />

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
                                setResource({
                                  ...resource,
                                  fields: [
                                    ...resource.fields.filter(
                                      ({ fieldId }) => fieldId !== f.id,
                                    ),
                                    {
                                      fieldId: f.id,
                                      fieldType: f.type,
                                      templateId: f.templateId,
                                      value,
                                    },
                                  ],
                                })
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
