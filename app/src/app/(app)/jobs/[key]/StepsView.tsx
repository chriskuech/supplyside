'use client'

import {
  fields,
  Resource,
  Schema,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
  ValueResource,
} from '@supplyside/model'
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  ChevronRight,
  Close,
  Info,
  PrecisionManufacturing,
  ShoppingBag,
} from '@mui/icons-material'
import { FC, useCallback, useState } from 'react'
import NextLink from 'next/link'
import { createResource, deleteResource } from '@/actions/resource'
import FieldControl from '@/lib/resource/fields/FieldControl'

type Props = {
  stepSchema: Schema
  steps: Resource[]
  part: Resource
}

export default function StepsView({ stepSchema, steps, part }: Props) {
  const [editStepId, setEditStepId] = useState<string | null>(null)

  const addWorkCenterStep = useCallback(async () => {
    const step = await createResource('Step', [
      {
        fieldId: selectSchemaFieldUnsafe(stepSchema, fields.part).fieldId,
        valueInput: { resourceId: part.id },
      },
    ])
    if (!step) return

    setEditStepId(step.id)
  }, [part.id, stepSchema])

  const addPurchaseStep = useCallback(async () => {
    const purchase = await createResource('Purchase', [])

    if (!purchase) return

    await createResource('Step', [
      {
        fieldId: selectSchemaFieldUnsafe(stepSchema, fields.part).fieldId,
        valueInput: { resourceId: part.id },
      },
      {
        fieldId: selectSchemaFieldUnsafe(stepSchema, fields.purchase).fieldId,
        valueInput: { resourceId: purchase.id },
      },
    ])
  }, [part.id, stepSchema])

  const step = steps.find((s) => s.id === editStepId)

  return (
    <>
      {step && (
        <WorkCenterModal
          stepSchema={stepSchema}
          step={step}
          onAdd={() => setEditStepId(null)}
          onCancel={() =>
            deleteResource(step.id).then(() => setEditStepId(null))
          }
        />
      )}
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
            onClick={addWorkCenterStep}
            sx={{ height: 'min-content' }}
            variant="text"
          >
            Work Center
          </Button>
          <Button
            startIcon={<Add />}
            size="small"
            onClick={addPurchaseStep}
            sx={{ height: 'min-content' }}
            variant="text"
          >
            Purchase
          </Button>
        </Stack>
        <Stack divider={<Divider />}>
          {steps.map((step, i) => (
            <StepView
              key={step.id}
              stepSchema={stepSchema}
              step={step}
              index={i + 1}
            />
          ))}
        </Stack>
      </Card>
    </>
  )
}

type StepViewProps = {
  stepSchema: Schema
  step: Resource
  index: number
}

const StepView: FC<StepViewProps> = ({ stepSchema, step, index }) => {
  const stepResourceType =
    selectResourceFieldValue(step, fields.workCenter)?.resource?.type ??
    selectResourceFieldValue(step, fields.purchase)?.resource?.type ??
    null

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
        <Stack direction="row" spacing={4}>
          <StepLink
            linkedResource={
              selectResourceFieldValue(step, fields.workCenter)?.resource ??
              selectResourceFieldValue(step, fields.purchase)?.resource ??
              null
            }
          />

          {stepResourceType === 'WorkCenter' && (
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
          )}
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
      </Stack>

      <Box py={0.5}>
        <IconButton onClick={() => deleteResource(step.id)} size="small">
          <Close />
        </IconButton>
      </Box>
    </Stack>
  )
}

type StepLinkProps = {
  linkedResource: ValueResource | null
}

const StepLink: FC<StepLinkProps> = ({ linkedResource }) => {
  if (!linkedResource) return null

  return (
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
        flexGrow: 1,
        overflow: 'ellipsis',
      }}
      component={NextLink}
      href={`/${linkedResource.type.toLowerCase()}s/${linkedResource.key}`}
      startIcon={
        linkedResource.type === 'WorkCenter' ? (
          <PrecisionManufacturing />
        ) : (
          <ShoppingBag />
        )
      }
      endIcon={<ChevronRight className="end-icon" />}
    >
      <Box flexGrow={1}>
        {linkedResource.type === 'WorkCenter'
          ? linkedResource.name
          : `Purchase Order #${linkedResource.key}`}
      </Box>
    </Button>
  )
}

type WorkCenterModalProps = {
  stepSchema: Schema
  step: Resource

  onCancel: () => void
  onAdd: () => void
}

const WorkCenterModal: FC<WorkCenterModalProps> = ({
  stepSchema,
  step,
  onAdd,
  onCancel,
}) => {
  const workCenter = selectResourceFieldValue(step, fields.workCenter)?.resource

  return (
    <Dialog open={true} onClose={onCancel}>
      <DialogTitle>Select a Work Center</DialogTitle>
      <DialogContent>
        <FieldControl
          resource={step}
          field={selectSchemaFieldUnsafe(stepSchema, fields.workCenter)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onAdd} disabled={!workCenter}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}
