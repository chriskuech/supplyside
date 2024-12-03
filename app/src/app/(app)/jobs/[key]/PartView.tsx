import {
  fields,
  Resource,
  SchemaData,
  selectResourceFieldValue,
} from '@supplyside/model'
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material'
import { FC, ReactNode } from 'react'
import { Print } from '@mui/icons-material'
import NextLink from 'next/link'
import FieldControl from '@/lib/resource/fields/FieldControl'
import { formatMoney } from '@/lib/format'
import AttachmentsToolbarControl from '@/lib/resource/detail/AttachmentsToolbarControl'

export const PartView: FC<{
  part: Resource
  partSchemaData: SchemaData
  stepsControl: ReactNode
}> = ({ part, partSchemaData, stepsControl }) => (
  <Stack spacing={1} flexGrow={1}>
    <Stack direction="row" alignItems="start" spacing={1}>
      <Stack spacing={1}>
        <FieldControl
          resource={part}
          schemaData={partSchemaData}
          field={fields.thumbnail}
          isImageDropzone
        />
        <Stack
          direction="row"
          justifyContent="space-evenly"
          alignItems="center"
        >
          <IconButton
            size="small"
            component={NextLink}
            href={`/integrations/internal/travelers/${part.id}`}
            target="_blank"
          >
            <Print fontSize="large" />
          </IconButton>
          <AttachmentsToolbarControl
            schemaData={partSchemaData}
            resource={part}
            field={fields.partAttachments}
            fontSize="large"
          />
        </Stack>
      </Stack>

      <Divider orientation="vertical" flexItem />

      <Stack spacing={1} flexGrow={1}>
        <Stack direction="row" spacing={1}>
          <Box flexGrow={1}>
            <FieldControl
              schemaData={partSchemaData}
              resource={part}
              inputId={`part-name-${part.id}`}
              field={fields.partName}
              inputProps={{ placeholder: 'Part Name' }}
            />
          </Box>
          <Box width={200}>
            <FieldControl
              schemaData={partSchemaData}
              resource={part}
              inputId={`need-date-${part.id}`}
              field={fields.needDate}
              inputProps={{ placeholder: 'Need Date' }}
            />
          </Box>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="end"
        >
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
            {formatMoney(
              selectResourceFieldValue(part, fields.totalCost)?.number,
            )}
          </Typography>
        </Stack>
        <Box flexGrow={1}>
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
      </Stack>
    </Stack>

    <Box pt={1} overflow="hidden">
      {stepsControl}
    </Box>
  </Stack>
)
