import { fail } from 'assert'
import { Box, Container, Stack } from '@mui/material'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import BillStatusTracker from './BillStatusTracker'
import CallToAction from './CallToAction'
import OrderLink from './tools/OrderLink'
import CancelControl from './tools/CancelControl'
import AssigneeToolbarControl from '@/lib/resource/detail/AssigneeToolbarControl'
import {
  billStatusOptions,
  fields,
} from '@/domain/schema/template/system-fields'
import { selectValue } from '@/domain/resource/types'
import { readDetailPageModel } from '@/lib/resource/detail/actions'
import ResourceDetailPage from '@/lib/resource/detail/ResourceDetailPage'
import { selectField } from '@/domain/schema/types'
import EditControl from '@/app/orders/[key]/tools/EditControl'
import AttachmentsToolbarControl from '@/lib/resource/detail/AttachmentsToolbarControl'

export default async function BillsDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const {
    session: { user },
    resource,
    schema,
  } = await readDetailPageModel('Bill', key)

  const status =
    selectValue(resource, fields.billStatus)?.option ?? fail('Status not found')

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

  const order = selectValue(resource, fields.order)?.resource

  return (
    <ResourceDetailPage
      schema={schema}
      resource={resource}
      tools={[
        ...(order ? [<OrderLink key={order.id} order={order} />] : []),
        <AttachmentsToolbarControl
          key={AttachmentsToolbarControl.name}
          resourceId={resource.id}
          resourceType={'Bill'}
          field={
            selectField(schema, fields.billAttachments) ??
            fail('Field not found')
          }
          value={selectValue(resource, fields.billAttachments)}
        />,
        <AssigneeToolbarControl
          key={AssigneeToolbarControl.name}
          resourceId={resource.id}
          resourceType={'Bill'}
          field={
            selectField(schema, fields.assignee) ?? fail('Field not found')
          }
          value={selectValue(resource, fields.assignee)}
        />,
        ...(!isDraft
          ? [<EditControl key={EditControl.name} resourceId={resource.id} />]
          : []),
        <CancelControl key={CancelControl.name} resourceId={resource.id} />,
      ]}
      backlinkField={fields.bill}
      isDraft={isDraft}
      actions={
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
                <BillStatusTracker resource={resource} />
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
                <CallToAction
                  key={selectValue(resource, fields.billStatus)?.option?.id}
                  schema={schema}
                  user={user}
                  resource={resource}
                />
              </Stack>
            </Stack>
          </Container>
          <Box flexGrow={1} bgcolor={'transparent'} />
        </Stack>
      }
    />
  )
}
