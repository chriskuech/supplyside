'use client'

import {
  fields,
  Resource,
  Schema,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import {
  Box,
  Button,
  Card,
  Divider,
  FormLabel,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Add,
  Checklist,
  Close,
  Info,
  Link,
  ShoppingBag,
  StoreMallDirectory,
} from '@mui/icons-material'
import { FC } from 'react'
import NextLink from 'next/link'
import { createResource, deleteResource } from '@/actions/resource'
import FieldControl from '@/lib/resource/fields/FieldControl'
import OptionChip from '@/lib/resource/fields/views/OptionChip'
import ReadonlyTextarea from '@/lib/resource/fields/views/ReadonlyTextarea'
import { formatDate } from '@/lib/format'

type Props = {
  stepSchema: Schema
  steps: { step: Resource; purchase: Resource | undefined }[]
  part: Resource
}

export default function StepsView({ stepSchema, steps, part }: Props) {
  return (
    <Card variant="outlined">
      <Stack
        direction="row"
        spacing={1}
        p={1}
        justifyContent="flex-end"
        alignItems="center"
      >
        <Checklist color="disabled" />
        <Typography variant="h6" gutterBottom flexGrow={1}>
          Steps
        </Typography>
        <Button
          startIcon={<Add />}
          size="small"
          onClick={() =>
            createResource('Step', [
              {
                fieldId: selectSchemaFieldUnsafe(stepSchema, fields.part)
                  .fieldId,
                valueInput: { resourceId: part.id },
              },
            ])
          }
          sx={{ height: 'min-content' }}
          variant="text"
        >
          Work Center
        </Button>
        <Button
          startIcon={<Add />}
          size="small"
          onClick={() =>
            createResource('Purchase', []).then(
              (purchase: Resource | undefined) =>
                purchase &&
                createResource('Step', [
                  {
                    fieldId: selectSchemaFieldUnsafe(stepSchema, fields.part)
                      .fieldId,
                    valueInput: { resourceId: part.id },
                  },
                  {
                    fieldId: selectSchemaFieldUnsafe(
                      stepSchema,
                      fields.purchase,
                    ).fieldId,
                    valueInput: { resourceId: purchase.id },
                  },
                ]),
            )
          }
          sx={{ height: 'min-content' }}
          variant="text"
        >
          Purchase
        </Button>
      </Stack>
      <Stack divider={<Divider />}>
        {steps.map(({ step, purchase }, i) => (
          <StepView
            key={step.id}
            stepSchema={stepSchema}
            step={step}
            purchase={purchase}
            index={i + 1}
          />
        ))}
      </Stack>
    </Card>
  )
}

type StepViewProps = {
  stepSchema: Schema
  step: Resource
  purchase: Resource | undefined
  index: number
}

const StepView: FC<StepViewProps> = ({ stepSchema, step, purchase, index }) => {
  const needDate =
    purchase && selectResourceFieldValue(purchase, fields.needDate)?.date
  const status =
    purchase &&
    selectResourceFieldValue(purchase, fields.purchaseStatus)?.option
  const purchaseDescription =
    purchase &&
    selectResourceFieldValue(purchase, fields.purchaseDescription)?.string
  const vendor =
    purchase && selectResourceFieldValue(purchase, fields.vendor)?.resource

  return (
    <Stack direction="row" spacing={1} p={2}>
      <Box sx={{ opacity: 0.5 }} width={40} textAlign="right" py={1}>
        <Typography
          sx={{
            opacity: 0.5,
            display: 'inline',
            fontSize: '0.7em',
            verticalAlign: 'text-top',
          }}
        >
          #
        </Typography>
        {index}
      </Box>

      <Box>
        <FieldControl
          field={selectSchemaFieldUnsafe(stepSchema, fields.completed)}
          resource={step}
        />
      </Box>

      <Stack direction="column" spacing={1} flexGrow={1}>
        {purchase ? (
          <>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="text"
                sx={{
                  alignItems: 'center',
                  '& .end-icon': {
                    visibility: 'hidden',
                  },
                  '&:hover .end-icon': {
                    visibility: 'visible',
                  },
                  py: 1,
                  overflow: 'ellipsis',
                }}
                component={NextLink}
                href={`/purchases/${purchase.key}`}
                startIcon={<ShoppingBag />}
                endIcon={<Link className="end-icon" />}
              >
                Purchase #{purchase.key}
              </Button>
              <Box flexGrow={1} />
              {vendor && (
                <Button
                  variant="text"
                  sx={{
                    alignItems: 'center',
                    '& .end-icon': {
                      visibility: 'hidden',
                    },
                    '&:hover .end-icon': {
                      visibility: 'visible',
                    },
                    py: 1,
                    overflow: 'ellipsis',
                  }}
                  component={NextLink}
                  href={`/vendor/${vendor.key}`}
                  startIcon={<StoreMallDirectory />}
                  endIcon={<Link className="end-icon" />}
                >
                  {vendor.name}
                </Button>
              )}
              {status && <OptionChip size="small" option={status} />}
              {needDate && (
                <Tooltip title="Need Date">
                  <strong>{formatDate(needDate) ?? '-'}</strong>
                </Tooltip>
              )}
            </Stack>

            {purchaseDescription && (
              <ReadonlyTextarea value={purchaseDescription} />
            )}
          </>
        ) : (
          <>
            <Stack direction="row" spacing={2}>
              <Box flexGrow={1}>
                <FieldControl
                  resource={step}
                  field={selectSchemaFieldUnsafe(stepSchema, fields.workCenter)}
                />
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="The number of hours required to complete the step, for Work Center scheduling.">
                  <FormLabel sx={{ fontSize: '0.7em', height: 'fit-content' }}>
                    Production
                    <br />
                    Hours <Info color="primary" sx={{ fontSize: '1em' }} />
                  </FormLabel>
                </Tooltip>
                <Box width={120}>
                  <FieldControl
                    field={selectSchemaFieldUnsafe(stepSchema, fields.hours)}
                    resource={step}
                  />
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="The number of days required to complete the step, for Job scheduling.">
                  <FormLabel sx={{ fontSize: '0.7em', height: 'fit-content' }}>
                    Production
                    <br />
                    Days <Info color="primary" sx={{ fontSize: '1em' }} />
                  </FormLabel>
                </Tooltip>
                <Box width={120}>
                  <FieldControl
                    field={selectSchemaFieldUnsafe(
                      stepSchema,
                      fields.productionDays,
                    )}
                    resource={step}
                  />
                </Box>
              </Stack>
            </Stack>

            <FieldControl
              field={selectSchemaFieldUnsafe(stepSchema, fields.otherNotes)}
              resource={step}
              inputProps={{ placeholder: 'Notes' }}
            />
          </>
        )}
      </Stack>

      <Box py={0.5}>
        <IconButton onClick={() => deleteResource(step.id)} size="small">
          <Close />
        </IconButton>
      </Box>
    </Stack>
  )
}
