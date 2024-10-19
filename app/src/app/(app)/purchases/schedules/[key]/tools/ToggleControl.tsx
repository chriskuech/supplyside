'use client'

import { PlayCircle, PauseCircle } from '@mui/icons-material'
import { Box, IconButton, Tooltip } from '@mui/material'
import {
  Resource,
  Schema,
  fields,
  isMissingRequiredFields,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { FC } from 'react'
import { updateResourceField } from '@/actions/resource'

type Props = {
  resource: Resource
  schema: Schema
  fontSize: 'small' | 'medium' | 'large'
}

export const ToggleControl: FC<Props> = ({ schema, resource, fontSize }) => {
  const field = selectSchemaFieldUnsafe(schema, fields.running)
  const isRunning =
    selectResourceFieldValue(resource, fields.running)?.boolean ?? false
  const isInvalid = isMissingRequiredFields(schema, resource)

  return (
    <Tooltip
      title={
        isRunning
          ? 'Pause (Edit)'
          : isInvalid
            ? 'Please fill in all required fields'
            : 'Start'
      }
    >
      <Box>
        <IconButton
          onClick={() =>
            updateResourceField(resource.id, {
              fieldId: field.fieldId,
              valueInput: { boolean: !isRunning },
            })
          }
          disabled={!isRunning && isInvalid}
          sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
          color="secondary"
          size={fontSize}
        >
          {isRunning ? (
            <PauseCircle fontSize={fontSize} />
          ) : (
            <PlayCircle fontSize={fontSize} />
          )}
        </IconButton>
      </Box>
    </Tooltip>
  )
}
