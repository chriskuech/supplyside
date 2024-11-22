import {
  fields,
  Resource,
  SchemaData,
  selectResourceFieldValue,
} from '@supplyside/model'
import { Box, Divider, Stack, Typography } from '@mui/material'
import { FC, ReactNode } from 'react'
import FieldControl from '@/lib/resource/fields/FieldControl'
import { formatMoney } from '@/lib/format'

export const PartView: FC<{
  part: Resource
  partSchemaData: SchemaData
  stepsControl: ReactNode
}> = ({ part, partSchemaData, stepsControl }) => (
  <Stack spacing={1} flexGrow={1}>
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box flexGrow={1}>
        <FieldControl
          schemaData={partSchemaData}
          resource={part}
          inputId={`part-name-${part.id}`}
          field={fields.partName}
          inputProps={{
            placeholder: 'Part Name',
          }}
        />
      </Box>
      <Box width={200}>
        <FieldControl
          schemaData={partSchemaData}
          resource={part}
          inputId={`need-date-${part.id}`}
          field={fields.needDate}
          inputProps={{
            placeholder: 'Need Date',
          }}
        />
      </Box>
      <Divider orientation="vertical" flexItem />

      <Box width={100}>
        <FieldControl
          schemaData={partSchemaData}
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
          schemaData={partSchemaData}
          resource={part}
          inputId={`unit-cost-${part.id}`}
          field={fields.unitCost}
          inputProps={{
            placeholder: 'Unit Cost',
          }}
        />
      </Box>
      <Box>=</Box>
      <Typography fontWeight="bold" fontSize="1.7em">
        {formatMoney(selectResourceFieldValue(part, fields.totalCost)?.number)}
      </Typography>
    </Stack>
    <Box>
      <FieldControl
        schemaData={partSchemaData}
        resource={part}
        inputId={`other-notes-${part.id}`}
        field={fields.otherNotes}
        inputProps={{
          placeholder: 'Other Notes',
        }}
      />
    </Box>
    <Box pt={1} overflow="hidden">
      {stepsControl}
    </Box>
  </Stack>
)
