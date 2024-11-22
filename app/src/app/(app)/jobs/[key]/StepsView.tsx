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
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Add,
  Assignment,
  CalendarMonth,
  Checklist,
  Close,
  Link,
  ShoppingBag,
  StickyNote2,
  StoreMallDirectory,
} from '@mui/icons-material'
import { FC } from 'react'
import NextLink from 'next/link'
import { createPurchaseStep, createWorkCenterStep, deleteStep } from './actions'
import FieldControl from '@/lib/resource/fields/FieldControl'
import OptionChip from '@/lib/resource/fields/views/OptionChip'
import ReadonlyTextarea from '@/lib/resource/fields/views/ReadonlyTextarea'
import ResourceTable from '@/lib/resource/table/ResourceTable'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
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

  const status =
    purchase &&
    selectResourceFieldValue(purchase, fields.purchaseStatus)?.option
  const purchaseDescription =
    purchase &&
    selectResourceFieldValue(purchase, fields.purchaseDescription)?.string
  const vendor =
    purchase && selectResourceFieldValue(purchase, fields.vendor)?.resource

  return (
    <Box px={12} py={2} position="relative">
      <Stack
        position="absolute"
        top={0}
        left={0}
        direction="row"
        alignItems="center"
        py={2}
        spacing={1}
      >
        <Box sx={{ opacity: 0.5 }} width={40} textAlign="right">
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

        <FieldControl
          schemaData={stepSchema}
          resource={step}
          field={fields.completed}
        />
      </Stack>

      <Box px={4} py={2.5} position="absolute" top={0} right={0}>
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

      <Stack direction="column" spacing={2} flexGrow={1}>
        {purchase ? (
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
          </Stack>
        ) : (
          <FieldControl
            schemaData={stepSchema}
            resource={step}
            field={fields.workCenter}
          />
        )}

        <Stack direction="row" spacing={1}>
          <Box flexShrink={0} pt={1}>
            <CalendarMonth color="disabled" />
          </Box>
          <Box flex={2}>
            <Typography variant="caption" gutterBottom>
              Production Hours
            </Typography>
            <FieldControl
              field={fields.hours}
              resource={step}
              schemaData={stepSchema}
              disabled={!!purchase}
            />
          </Box>
          <Box flex={2}>
            <Typography variant="caption" gutterBottom>
              Production Days
            </Typography>
            <FieldControl
              field={fields.productionDays}
              resource={step}
              schemaData={stepSchema}
            />
          </Box>
          <Box flex={3}>
            <Typography variant="caption" gutterBottom>
              Start Date
            </Typography>
            <FieldControl
              field={fields.startDate}
              resource={step}
              schemaData={stepSchema}
            />
          </Box>
          <Box flex={3}>
            <Typography variant="caption" gutterBottom>
              Delivery Date
            </Typography>
            <FieldControl
              field={fields.deliveryDate}
              resource={step}
              schemaData={stepSchema}
            />
          </Box>
        </Stack>

        {(!purchase || purchaseDescription) && (
          <Stack direction="row" spacing={1}>
            <Box flexShrink={0}>
              <StickyNote2 color="disabled" />
            </Box>
            <Box flexGrow={1}>
              {purchase ? (
                <ReadonlyTextarea value={purchaseDescription ?? '-'} />
              ) : (
                <FieldControl
                  schemaData={stepSchema}
                  resource={step}
                  field={fields.otherNotes}
                  inputProps={{ placeholder: 'Notes' }}
                />
              )}
            </Box>
          </Stack>
        )}

        {!purchase && (
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
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
                buttonProps={{ size: 'small' }}
              />
            </Stack>

            {!!operations.length && (
              <Box pl={4}>
                <Card variant="outlined">
                  <ResourceTable
                    tableKey="operations"
                    schemaData={operationSchema}
                    resources={operations}
                    isEditable
                    hideId
                    slots={{ toolbar: undefined }}
                    hideFields={[fields.step, fields.workCenter]}
                  />
                </Card>
              </Box>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
