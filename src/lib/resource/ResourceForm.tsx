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
import { useEffect, useMemo, useState } from 'react'
import { debounce } from 'remeda'
import { ResourceType } from '@prisma/client'
import { readSchema } from '../schema/actions'
import FieldControl from './fields/FieldControl'
import { chunkByN } from './chunkByN'
import Field from './fields/controls/Field'
import { readResource, updateResource } from './actions'
import { Schema } from '@/domain/schema/types'
import {
  selectResourceField,
  setResourceField,
} from '@/domain/resource/extensions'
import { Resource } from '@/domain/resource/entity'
import { mapValueToValueInput } from '@/domain/resource/mappers'

type Props = {
  resourceId?: string
  resource?: Resource
  schema?: Schema
  resourceType?: ResourceType
  singleColumn?: boolean
}

export default function ResourceForm({
  resourceId,
  resourceType,
  schema: defaultSchema,
  resource: defaultResource,
  singleColumn,
}: Props) {
  const columns = singleColumn ? 1 : 3

  const [schema, setSchema] = useState<Schema | null>(defaultSchema ?? null)
  const [resource, setResource] = useState<Resource | null>(
    defaultResource ?? null,
  )

  const changeHandler = useMemo(
    () =>
      debounce(
        (resource: Resource) =>
          updateResource({
            resourceId: resource.id,
            fields: resource.fields.map(({ fieldId, fieldType, value }) => ({
              fieldId,
              value: mapValueToValueInput(fieldType, value),
            })),
          }),
        {
          timing: 'trailing',
          waitMs: 500,
        },
      ).call,
    [],
  )

  useEffect(() => {
    if (!schema && resourceType) {
      readSchema({ resourceType }).then(setSchema)
    }

    if (resourceId && resource?.id !== resourceId) {
      readResource({ id: resourceId }).then(setResource)
    }
  }, [schema, resource?.id, resourceType, resourceId])

  useEffect(() => {
    resource && changeHandler(resource)
  }, [resource, changeHandler])

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
                                setResource(
                                  setResourceField(resource, f, value),
                                )
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
