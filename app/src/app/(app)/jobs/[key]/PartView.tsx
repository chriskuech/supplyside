
import {
  fields,
  Resource,
  Schema,
  selectResourceFieldValue,
} from '@supplyside/model'
import { Box, Divider, Stack, Typography } from '@mui/material'
import { FC, ReactNode } from 'react'
import FieldControl from '@/lib/resource/fields/FieldControl'
import { formatMoney } from '@/lib/format'

export const PartView: FC<{
  part: Resource
  partSchema: Schema
  stepsControl: ReactNode
}> = ({ part, partSchema, stepsControl }) => (
  <Stack spacing={2} direction="row" alignItems="start">
    <Stack spacing={1} flexGrow={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box flexGrow={1}>
          <FieldControl
            schema={partSchema}
            resource={part}
            inputId={`part-name-${part.id}`}
            field={fields.partName}
            inputProps={{
              placeholder: 'Part Name',
            }}
          />
        </Box>
        <Box>
          <FieldControl
            schema={partSchema}
            resource={part}
            inputId={`need-date-${part.id}`}
            field={fields.needDate}
            inputProps={{
              placeholder: 'Need Date',
            }}
          />
        </Box>
      </Stack>
      <Box>
        <FieldControl
          schema={partSchema}
          resource={part}
          inputId={`other-notes-${part.id}`}
          field={fields.otherNotes}
          inputProps={{
            placeholder: 'Other Notes',
          }}
        />
      </Box>
      <Box pt={1}>{stepsControl}</Box>
    </Stack>
    <Divider orientation="vertical" flexItem />
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box width={100}>
          <FieldControl
            schema={partSchema}
            resource={part}
            inputId={`quantity-${part.id}`}
            field={fields.quantity}
            inputProps={{
              placeholder: 'Qty',
            }}
          />
        </Box>
        <Box>&times;</Box>
        <Box width={140}>
          <FieldControl
            schema={partSchema}
            resource={part}
            inputId={`unit-cost-${part.id}`}
            field={fields.unitCost}
            inputProps={{
              placeholder: 'Unit Cost',
            }}
          />
        </Box>
      </Stack>
      <Stack
        direction="row"
        justifyContent="end"
        alignItems="center"
        spacing={1}
      >
        <Box>=</Box>
        <Typography fontWeight="bold" fontSize="1.7em">
          {formatMoney(
            selectResourceFieldValue(part, fields.totalCost)?.number,
          )}
        </Typography>
      </Stack>
    </Stack>
  </Stack>
)
