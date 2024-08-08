import { fail } from 'assert'
import { Box, Container, Stack, Typography } from '@mui/material'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import Toolbar from './Toolbar'
import BillStatusTracker from './BillStatusTracker'
import CallToAction from './CallToAction'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import { readResource } from '@/domain/resource/actions'
import { readSchema } from '@/domain/schema/actions'
import { readResources } from '@/domain/resource/actions'
import LinesAndCosts from '@/lib/resource/LinesAndCosts'
import {
  billStatusOptions,
  fields,
} from '@/domain/schema/template/system-fields'
import { selectValue } from '@/domain/resource/types'
import { readUser } from '@/lib/iam/actions'

export default async function BillsDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { accountId } = await requireSessionWithRedirect()
  const [user, resource, schema] = await Promise.all([
    readUser(),
    readResource({ accountId, type: 'Bill', key: Number(key) }),
    readSchema({ accountId, resourceType: 'Bill' }),
  ])

  const [lineSchema, lineResources] = await Promise.all([
    readSchema({ accountId, resourceType: 'Line' }),
    readResources({
      accountId,
      type: 'Line',
      where: {
        '==': [{ var: 'Bill' }, resource.id],
      },
    }),
  ])

  const status =
    selectValue(resource, fields.billStatus)?.option ?? fail('Status not found')

  const isDraft = status?.templateId === billStatusOptions.draft.templateId

  const statusColorStart = match(status?.templateId)
    .with(billStatusOptions.draft.templateId, () => yellow[600])
    .with(billStatusOptions.paid.templateId, () => green[900])
    .with(billStatusOptions.canceled.templateId, () => red[900])
    .otherwise(() => yellow[900])

  const statusColorEnd = match(status?.templateId)
    .with(billStatusOptions.draft.templateId, () => yellow[500])
    .with(billStatusOptions.paid.templateId, () => green[800])
    .with(billStatusOptions.canceled.templateId, () => red[800])
    .otherwise(() => yellow[800])

  return (
    <Stack>
      <Container sx={{ py: 5 }}>
        <Stack direction="row" spacing={2} alignItems={'center'}>
          <Typography variant="h3" flexGrow={1}>
            <span style={{ opacity: 0.5 }}>Bill #</span>
            <span>{key}</span>
          </Typography>
          <Toolbar
            key={status?.id}
            schema={schema}
            resourceId={resource.id}
            isDraft={isDraft}
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
                resourceId={resource.id}
              />
            </Stack>
          </Stack>
        </Container>
        <Box flexGrow={1} bgcolor={'transparent'} />
      </Stack>

      <Container sx={{ py: 5 }}>
        <Stack spacing={5}>
          <ResourceFieldsControl schema={schema} resourceId={resource.id} />
          <LinesAndCosts
            resource={resource}
            lineSchema={lineSchema}
            lines={lineResources}
            newLineInitialData={{
              [fields.bill.name]: resource.id,
            }}
          />
        </Stack>
      </Container>
    </Stack>
  )
}
