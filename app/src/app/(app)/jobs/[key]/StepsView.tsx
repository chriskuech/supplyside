'use client'

import {
  fields,
  Resource,
  SchemaData,
  selectResourceFieldValue,
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
  Assignment,
  Checklist,
  Close,
  Info,
  Link,
  ShoppingBag,
  StoreMallDirectory,
} from '@mui/icons-material'
import { FC, useRef } from 'react'
import NextLink from 'next/link'
import { createPurchaseStep, createWorkCenterStep, deleteStep } from './actions'
import FieldControl from '@/lib/resource/fields/FieldControl'
import OptionChip from '@/lib/resource/fields/views/OptionChip'
import ReadonlyTextarea from '@/lib/resource/fields/views/ReadonlyTextarea'
import { formatDate } from '@/lib/format'
import ResourceTable from '@/lib/resource/table/ResourceTable'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import { useConfirmation } from '@/lib/confirmation'

type Props = {
  stepSchemaData: SchemaData
  operationSchema: SchemaData
  steps: {
    step: Resource
    purchase: Resource | undefined
    operations: Resource[] | undefined
  }[]
  part: Resource
}

const missingNeedDateTooltip = 'Need Date is required to add Steps'

export default function StepsView({
  stepSchemaData,
  operationSchema,
  steps,
  part,
}: Props) {
  const needDate = selectResourceFieldValue(part, fields.needDate)?.date

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
        <Tooltip
          title={
            !needDate
              ? missingNeedDateTooltip
              : 'Add a Production Step representing work completed at a Work Center'
          }
        >
          <span>
            <Button
              startIcon={<Add />}
              size="small"
              onClick={() => createWorkCenterStep(part.id)}
              sx={{ height: 'min-content' }}
              disabled={!needDate}
            >
              Work Center
            </Button>
          </span>
        </Tooltip>
        <Tooltip
          title={
            !needDate
              ? missingNeedDateTooltip
              : 'Add a Production Step linked to a Purchase Order, such as for materials or outside processing'
          }
        >
          <span>
            <Button
              startIcon={<Add />}
              size="small"
              onClick={() => createPurchaseStep(part.id)}
              sx={{ height: 'min-content' }}
              disabled={!needDate}
            >
              Purchase
            </Button>
          </span>
        </Tooltip>
      </Stack>
      <Stack divider={<Divider />}>
        {steps.map(({ step, purchase, operations = [] }, i) => (
          <StepView
            key={step.id}
            stepSchemaData={stepSchemaData}
            step={step}
            purchase={purchase}
            index={i + 1}
            operationSchema={operationSchema}
            operations={operations}
          />
        ))}
      </Stack>
    </Card>
  )
}

type StepViewProps = {
  stepSchemaData: SchemaData
  step: Resource
  purchase: Resource | undefined
  index: number
  operationSchema: SchemaData
  operations: Resource[]
}

const StepView: FC<StepViewProps> = ({
  stepSchemaData: stepSchema,
  step,
  purchase,
  index,
  operationSchema,
  operations,
}) => {
  const confirm = useConfirmation()
  const operationsFrameRef = useRef<HTMLDivElement>(null)
  const operationsFrameBox = useResizeObserver(operationsFrameRef)

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
          schemaData={stepSchema}
          resource={step}
          field={fields.completed}
        />
      </Box>

      <Stack direction="column" spacing={1} flexGrow={1}>
        {purchase ? (
          <>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
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
                    schemaData={stepSchema}
                    resource={step}
                    field={fields.productionDays}
                  />
                </Box>
              </Stack>
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
                  schemaData={stepSchema}
                  resource={step}
                  field={fields.workCenter}
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
                    schemaData={stepSchema}
                    resource={step}
                    field={fields.hours}
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
                    schemaData={stepSchema}
                    resource={step}
                    field={fields.productionDays}
                  />
                </Box>
              </Stack>
            </Stack>

            <FieldControl
              schemaData={stepSchema}
              resource={step}
              field={fields.otherNotes}
              inputProps={{ placeholder: 'Notes' }}
            />

            <Card variant="outlined">
              <Stack spacing={1} ref={operationsFrameRef}>
                <Stack direction="row" alignItems="center" p={1} spacing={1}>
                  <Assignment color="disabled" />
                  <Typography variant="h6" flexGrow={1}>
                    Operations
                  </Typography>
                  <CreateResourceButton
                    resourceType="Operation"
                    fields={[
                      {
                        field: fields.step,
                        valueInput: { resourceId: step.id },
                      },
                      {
                        field: fields.sequenceNumber,
                        valueInput: { number: operations.length + 1 },
                      },
                    ]}
                    buttonProps={{ size: 'small', variant: 'text' }}
                  />
                </Stack>

                {!!operations.length && (
                  <Box width={operationsFrameBox?.width ?? 0} overflow="auto">
                    <ResourceTable
                      schemaData={operationSchema}
                      resources={operations}
                      isEditable
                      hideId
                      slots={{ toolbar: undefined }}
                      hideFields={[fields.step, fields.workCenter]}
                    />
                  </Box>
                )}
              </Stack>
            </Card>
          </>
        )}
      </Stack>

      <Box py={0.5}>
        <IconButton
          onClick={async () => {
            const isConfirmed = await confirm({
              title: 'Delete Step',
              content: 'Are you sure you want to delete this step?',
            })
            if (!isConfirmed) return

            deleteStep(step.id)
          }}
          size="small"
        >
          <Close />
        </IconButton>
      </Box>
    </Stack>
  )
}
