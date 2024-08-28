import { fail } from 'assert'
import { Box, Container, Stack, Typography } from '@mui/material'
import { match, P } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import { FieldType } from '@prisma/client'
import { isArray, isNullish } from 'remeda'
import OrderStatusTracker from './OrderStatusTracker'
import ApproveButton from './cta/ApproveButton'
import SkipButton from './cta/SkipButton'
import StatusTransitionButton from './cta/StatusTransitionButton'
import SendPoButton from './cta/SendPoButton'
import Toolbar from './Toolbar'
import { findOrderBills } from './actions'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import {
  fields,
  orderStatusOptions,
} from '@/domain/schema/template/system-fields'
import { Resource, selectValue } from '@/domain/resource/types'
import PreviewDraftPoButton from '@/app/orders/[key]/cta/PreviewDraftPoButton'
import LinesAndCosts from '@/lib/resource/grid/LinesAndCosts'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import { Value } from '@/domain/resource/values/types'

const mapFieldTypeToValueColumn = (t: FieldType) =>
  match<FieldType, keyof Value>(t)
    .with('Checkbox', () => 'boolean')
    .with('Date', () => 'date')
    .with('File', () => 'file')
    .with(P.union('Money', 'Number'), () => 'number')
    .with('User', () => 'user')
    .with('Select', () => 'option')
    .with(P.union('Textarea', 'Text'), () => 'string')
    .with('Resource', () => 'resource')
    .with('Contact', () => 'contact')
    .with('Files', () => 'files')
    .with('MultiSelect', () => 'options')
    .exhaustive()

const selectResourceFieldValue = (resource: Resource, fieldId: string) => {
  const field = resource.fields.find((rf) => rf.fieldId === fieldId)

  const valueColumn = field && mapFieldTypeToValueColumn(field.fieldType)

  if (!field || !valueColumn) {
    return undefined
  }

  return field?.value[valueColumn]
}

export default async function OrderDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const {
    session: { user },
    resource,
    schema,
  } = await readDetailPageModel('Order', key)

  const orderBills = await findOrderBills(resource.id)

  const status =
    selectValue(resource, fields.orderStatus)?.option ??
    fail('Status not found')

  const isDraft = status.templateId === orderStatusOptions.draft.templateId

  const statusColorStart = match(status.templateId)
    .with(orderStatusOptions.draft.templateId, () => yellow[600])
    .with(orderStatusOptions.received.templateId, () => green[900])
    .with(orderStatusOptions.canceled.templateId, () => red[900])
    .otherwise(() => yellow[900])

  const statusColorEnd = match(status.templateId)
    .with(orderStatusOptions.draft.templateId, () => yellow[500])
    .with(orderStatusOptions.received.templateId, () => green[800])
    .with(orderStatusOptions.canceled.templateId, () => red[800])
    .otherwise(() => yellow[800])

  const hasInvalidFields = schema.allFields.some((field) => {
    const value = selectResourceFieldValue(resource, field.id)

    return (
      field.isRequired &&
      (isNullish(value) || (isArray(value) && value.length === 0))
    )
  })

  return (
    <Stack>
      <Container sx={{ py: 5 }}>
        <Stack direction={'row'} alignItems={'center'} spacing={1}>
          <Typography variant="h3">
            <span style={{ opacity: 0.5 }}>Order #</span>
            <span>{key}</span>
          </Typography>

          <Box flexGrow={1} />

          <Toolbar
            key={status.id}
            resource={resource}
            schema={schema}
            isDraft={isDraft}
            bills={orderBills}
          />
        </Stack>
      </Container>

      <Stack direction={'row'} height={100}>
        <Box
          flexGrow={1}
          height={70}
          my={'15px'}
          sx={{
            background: `linear-gradient(90deg, ${statusColorStart} 0%, ${statusColorEnd} 100%)`,
          }}
        />
        <Container sx={{ flexShrink: 0 }} disableGutters>
          <Stack
            direction={'row'}
            sx={{ overflowX: 'hidden', height: 100 }}
            alignItems={'center'}
          >
            <Box sx={{ borderRadius: 10, flexGrow: 1 }}>
              <OrderStatusTracker resource={resource} />
            </Box>
            <Stack
              width={400}
              flexShrink={0}
              direction={'row'}
              justifyContent={'end'}
              alignItems={'center'}
              spacing={2}
              mr={3}
            >
              {isDraft && (
                <>
                  <PreviewDraftPoButton resourceId={resource.id} />
                  <StatusTransitionButton
                    isDisabled={hasInvalidFields}
                    tooltip={
                      hasInvalidFields
                        ? 'Please fill in all required fields before submitting'
                        : undefined
                    }
                    resourceId={resource.id}
                    statusOption={orderStatusOptions.submitted}
                    label={'Submit'}
                  />
                </>
              )}
              {status.templateId ===
                orderStatusOptions.submitted.templateId && (
                <>
                  <PreviewDraftPoButton resourceId={resource.id} />
                  <ApproveButton
                    resourceId={resource.id}
                    isDisabled={!user.isApprover}
                  />
                </>
              )}
              {status.templateId === orderStatusOptions.approved.templateId && (
                <>
                  <SendPoButton resourceId={resource.id} />
                  <SkipButton resourceId={resource.id} />
                </>
              )}
              {status.templateId === orderStatusOptions.ordered.templateId && (
                <StatusTransitionButton
                  resourceId={resource.id}
                  statusOption={orderStatusOptions.received}
                  label={'Confirm Receipt'}
                />
              )}
              {(status.templateId === orderStatusOptions.received.templateId ||
                status.templateId ===
                  orderStatusOptions.canceled.templateId) && (
                <Typography sx={{ opacity: 0.5 }}>
                  No further action required
                </Typography>
              )}
            </Stack>
          </Stack>
        </Container>
        <Box flexGrow={1} bgcolor={'transparent'} />
      </Stack>

      <Container sx={{ py: 5 }}>
        <Stack spacing={5}>
          <ResourceFieldsControl
            key={status.id}
            schema={schema}
            resource={resource}
            isReadOnly={!isDraft}
          />
          <LinesAndCosts
            resource={resource}
            lineQuery={{
              '==': [{ var: 'Order' }, resource.id],
            }}
            newLineInitialData={{
              [fields.order.name]: resource.id,
            }}
            isReadOnly={!isDraft}
          />
        </Stack>
      </Container>
    </Stack>
  )
}
