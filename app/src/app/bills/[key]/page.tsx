import { fail } from 'assert'
import { Box, Container, Stack } from '@mui/material'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import {
  billStatusOptions,
  fields,
  selectResourceFieldValue,
  selectSchemaField,
} from '@supplyside/model'
import BillStatusTracker from './BillStatusTracker'
import CallToAction from './CallToAction'
import PurchaseLink from './tools/PurchaseLink'
import CancelControl from './tools/CancelControl'
import EditControl from './tools/EditControl'
import AssigneeToolbarControl from '@/lib/resource/detail/AssigneeToolbarControl'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'
import AttachmentsToolbarControl from '@/lib/resource/detail/AttachmentsToolbarControl'
import QuickBooksLink from '@/lib/quickBooks/QuickBooksLink'
import { getBillUrl } from '@/quickBooks'

export default async function BillsDetail({
  params: { key },
  searchParams,
}: {
  params: { key: string }
  searchParams: Record<string, unknown>
}) {
  const { resource, schema, lineSchema, user } = await readDetailPageModel(
    'Bill',
    key,
  )

  const status =
    selectResourceFieldValue(resource, fields.billStatus)?.option ??
    fail('Status not found')

  const isDraft = status.templateId === billStatusOptions.draft.templateId

  const statusColorStart = match(status.templateId)
    .with(billStatusOptions.draft.templateId, () => yellow[600])
    .with(billStatusOptions.paid.templateId, () => green[900])
    .with(billStatusOptions.canceled.templateId, () => red[900])
    .otherwise(() => yellow[900])

  const statusColorEnd = match(status.templateId)
    .with(billStatusOptions.draft.templateId, () => yellow[500])
    .with(billStatusOptions.paid.templateId, () => green[800])
    .with(billStatusOptions.canceled.templateId, () => red[800])
    .otherwise(() => yellow[800])

  const purchase = selectResourceFieldValue(resource, fields.purchase)?.resource

  const quickBooksBillId = selectResourceFieldValue(
    resource,
    fields.quickBooksBillId,
  )?.string

  const quickBooksAppUrl = quickBooksBillId
    ? getBillUrl(quickBooksBillId)
    : undefined

  return (
    <ResourceDetailPage
      lineSchema={lineSchema}
      schema={schema}
      resource={resource}
      searchParams={searchParams}
      tools={[
        ...(quickBooksAppUrl
          ? [
              <QuickBooksLink
                key={QuickBooksLink.name}
                quickBooksAppUrl={quickBooksAppUrl}
              />,
            ]
          : []),
        ...(purchase
          ? [<PurchaseLink key={purchase.id} purchase={purchase} />]
          : []),
        <AttachmentsToolbarControl
          key={AttachmentsToolbarControl.name}
          resourceId={resource.id}
          resourceType="Bill"
          field={
            selectSchemaField(schema, fields.billAttachments) ??
            fail('Field not found')
          }
          value={selectResourceFieldValue(resource, fields.billAttachments)}
        />,
        <AssigneeToolbarControl
          key={AssigneeToolbarControl.name}
          resourceId={resource.id}
          resourceType="Bill"
          field={
            selectSchemaField(schema, fields.assignee) ??
            fail('Field not found')
          }
          value={selectResourceFieldValue(resource, fields.assignee)}
        />,
        ...(!isDraft
          ? [<EditControl key={EditControl.name} resourceId={resource.id} />]
          : []),
        <CancelControl key={CancelControl.name} resourceId={resource.id} />,
      ]}
      backlinkField={fields.bill}
      isReadOnly={!isDraft}
      actions={
        <Stack direction="row" height={100}>
          <Box
            flexGrow={1}
            height={70}
            my="15px"
            sx={{
              background: `linear-gradient(90deg, ${statusColorStart} 0%, ${statusColorEnd} 100%)`,
            }}
          />
          <Container sx={{ flexShrink: 0 }} disableGutters>
            <Stack
              direction="row"
              sx={{ overflowX: 'hidden', height: 100 }}
              alignItems="center"
            >
              <Box sx={{ borderRadius: 10, flexGrow: 1 }}>
                <BillStatusTracker resource={resource} />
              </Box>
              <Stack
                width={400}
                flexShrink={0}
                direction="row"
                justifyContent="end"
                alignItems="center"
                spacing={2}
                mr={3}
              >
                <CallToAction
                  key={
                    selectResourceFieldValue(resource, fields.billStatus)
                      ?.option?.id
                  }
                  schema={schema}
                  self={user}
                  resource={resource}
                />
              </Stack>
            </Stack>
          </Container>
          <Box flexGrow={1} bgcolor="transparent" />
        </Stack>
      }
    />
  )
}
