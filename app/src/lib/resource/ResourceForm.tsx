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
import { useSnackbar } from 'notistack'
import { Resource, mapValueToValueInput, Schema } from '@supplyside/model'
import { selectResourceFieldValue } from '@supplyside/model'
import FieldControl from './fields/FieldControl'
import { chunkByN } from './chunkByN'
import Field from './fields/controls/Field'
import { updateResourceField } from '@/actions/resource'

type Props = {
  schema: Schema
  resource: Resource
  singleColumn?: boolean
}

export default function ResourceForm({
  schema,
  resource,
  singleColumn,
}: Props) {
  const { enqueueSnackbar } = useSnackbar()

  const columns = singleColumn ? 1 : 3

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
                    inputId={`rf-${singleField.fieldId}`}
                    resourceId={resource.id}
                    field={
                      singleField ??
                      fail('Assumed a single field was asserted above')
                    }
                    value={selectResourceFieldValue(resource, singleField)}
                    disabled={!!resource.templateId && !!singleField.templateId}
                  />
                </Box>
              ) : (
                <Stack spacing={3} direction="row">
                  {chunkByN(s.fields, columns).map((fs, i) => (
                    <Stack key={i} spacing={3} flex={1}>
                      {fs.map((f) => (
                        <Stack key={f.fieldId}>
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
                              disabled={!!resource.templateId && !!f.templateId}
                              inputId={`rf-${f.fieldId}`}
                              resourceId={resource.id}
                              field={f}
                              value={selectResourceFieldValue(resource, {
                                fieldId: f.fieldId,
                              })}
                              onChange={async (value) => {
                                const result = await updateResourceField(
                                  resource.id,
                                  {
                                    fieldId: f.fieldId,
                                    valueInput: mapValueToValueInput(
                                      f.type,
                                      value,
                                    ),
                                  },
                                )

                                if (!result) {
                                  enqueueSnackbar('Failed to update field', {
                                    variant: 'error',
                                  })
                                }
                              }}
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
