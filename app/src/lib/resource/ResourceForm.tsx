'use client'
import { fail } from 'assert'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { ExpandMore, Sync } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { Resource, mapValueToValueInput, Schema } from '@supplyside/model'
import { selectResourceFieldValue } from '@supplyside/model'
import FieldControl from './fields/FieldControl'
import { chunkByN } from './chunkByN'
import Field from './fields/controls/Field'
import { updateResourceField, copyFromResource } from '@/actions/resource'

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

        const sectionHasRequiredFields = s.fields.some((f) => f.isRequired)

        return (
          <Accordion
            key={s.id}
            defaultExpanded={i === 0 || sectionHasRequiredFields}
            variant="outlined"
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6" fontWeight="bold">
                {s.name}
                {sectionHasRequiredFields && (
                  <Typography
                    color="error"
                    display="inline"
                    variant="overline"
                    fontWeight="bold"
                    ml={0.5}
                    sx={{ verticalAlign: 'super' }}
                  >
                    *
                  </Typography>
                )}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {singleField ? (
                <Box>
                  {singleField.name !== s.name && (
                    <Typography variant="overline" gutterBottom>
                      {singleField.name}
                      {s.fields.at(0)?.isRequired && (
                        <Typography
                          color="error"
                          display="inline"
                          fontWeight="bold"
                          ml={0.5}
                          sx={{ verticalAlign: 'super' }}
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
                    resource={resource}
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
                          <Stack direction="row" alignItems="center">
                            <Typography
                              variant="overline"
                              fontSize={14}
                              lineHeight="unset"
                              flexGrow={1}
                            >
                              {f.name}
                              {f.isRequired && (
                                <Typography
                                  color="error"
                                  display="inline"
                                  variant="overline"
                                  fontWeight="bold"
                                  ml={0.5}
                                  sx={{ verticalAlign: 'super' }}
                                >
                                  *
                                </Typography>
                              )}
                            </Typography>
                            {f.type === 'Resource' && (
                              <Tooltip title={`Sync data from ${f.name}`}>
                                <IconButton
                                  color="secondary"
                                  disabled={
                                    !selectResourceFieldValue(resource, f)
                                      ?.resource
                                  }
                                  onClick={async () => {
                                    const resourceId = selectResourceFieldValue(
                                      resource,
                                      f,
                                    )?.resource?.id

                                    if (!resourceId) return

                                    try {
                                      await copyFromResource(resource.id, {
                                        resourceId,
                                      })
                                    } catch {
                                      enqueueSnackbar(
                                        `Failed to extract data from ${f.name}`,
                                        { variant: 'error' },
                                      )
                                    }
                                  }}
                                >
                                  <Sync fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                          <Typography variant="caption" gutterBottom>
                            {f.description}
                          </Typography>
                          <Box>
                            <Field
                              disabled={!!resource.templateId && !!f.templateId}
                              inputId={`rf-${f.fieldId}`}
                              resource={resource}
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
