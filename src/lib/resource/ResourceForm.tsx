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
import { useMemo } from 'react'
import useSchema from '../schema/useSchema'
import FieldControl from './fields/FieldControl'
import { chunkByN } from './chunkByN'
import Field from './fields/controls/Field'
import { updateResourceField } from './actions'
import { selectResourceField } from '@/domain/resource/extensions'
import { Resource } from '@/domain/resource/entity'
import { mapValueToValueInput } from '@/domain/resource/mappers'
import { resources } from '@/domain/schema/template/system-resources'

type Props = {
  resource: Resource
  resourceType: ResourceType
  singleColumn?: boolean
}

export default function ResourceForm({
  resource,
  resourceType,
  singleColumn,
}: Props) {
  const disabledFieldTemplateIds = useMemo(
    () =>
      new Set(
        Object.values(resources)
          .find((r) => r.templateId === resource.templateId)
          ?.fields.map((f) => f.field.templateId) ?? [],
      ),
    [resource.templateId],
  )

  const columns = singleColumn ? 1 : 3

  const schema = useSchema(resourceType)
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
                    disabled={
                      !!resource.templateId &&
                      !!singleField.templateId &&
                      disabledFieldTemplateIds.has(singleField.templateId)
                    }
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
                              disabled={
                                !!resource.templateId &&
                                !!f.templateId &&
                                disabledFieldTemplateIds.has(f.templateId)
                              }
                              inputId={`rf-${f.id}`}
                              resourceId={resource.id}
                              field={f}
                              value={selectResourceField(resource, {
                                fieldId: f.id,
                              })}
                              onChange={(value) =>
                                updateResourceField({
                                  resourceId: resource.id,
                                  fieldId: f.id,
                                  value: mapValueToValueInput(f.type, value),
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
