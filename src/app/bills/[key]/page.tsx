import { fail } from 'assert'
import { Box, Container, Stack, Typography } from '@mui/material'
import { match } from 'ts-pattern'
import { green, red, yellow } from '@mui/material/colors'
import Toolbar from './Toolbar'
import BillStatusTracker from './BillStatusTracker'
import CallToAction from './CallToAction'
import { requireSessionWithRedirect } from '@/lib/iam/actions'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import { readResource } from '@/domain/resource/actions'
import { readSchema } from '@/domain/schema/actions'
import {
  billStatusOptions,
  fields,
} from '@/domain/schema/template/system-fields'
import { selectValue } from '@/domain/resource/types'
import LinesAndCosts from '@/lib/resource/grid/LinesAndCosts'

export default async function BillsDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { accountId, user } = await requireSessionWithRedirect()
  const [resource, schema] = await Promise.all([
    readResource({ accountId, type: 'Bill', key: Number(key) }),
    readSchema({ accountId, resourceType: 'Bill' }),
  ])

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

  return (
    <Stack>
      <Container sx={{ py: 5 }}>
        <Stack direction="row" spacing={2} alignItems={'center'}>
          <Typography variant="h3" flexGrow={1}>
            <span style={{ opacity: 0.5 }}>Bill #</span>
            <span>{key}</span>
          </Typography>
          <Toolbar
            key={status.id}
            schema={schema}
            resource={resource}
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
                resource={resource}
              />
            </Stack>
          </Stack>
        </Container>
        <Box flexGrow={1} bgcolor={'transparent'} />
      </Stack>

      <Container sx={{ py: 5 }}>
        <Stack spacing={5}>
          <ResourceFieldsControl schema={schema} resource={resource} />
          <LinesAndCosts
            lineQuery={{ '==': [{ var: 'Bill' }, resource.id] }}
            resource={resource}
            newLineInitialData={{
              [fields.bill.name]: resource.id,
            }}
          />
        </Stack>
      </Container>
    </Stack>
  )
}
