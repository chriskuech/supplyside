import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { AddLink, ArrowRight } from '@mui/icons-material'
import Toolbar from './Toolbar'
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

export default async function BillsDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { accountId } = await requireSessionWithRedirect()
  const [resource, schema] = await Promise.all([
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

  const status = selectValue(resource, fields.billStatus)?.option
  const isDraft = status?.templateId === billStatusOptions.draft.templateId

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems={'center'}>
            <Typography variant="h3" flexGrow={1}>
              <span style={{ opacity: 0.5 }}>Bill #</span>
              <span>{key}</span>
            </Typography>
            <Toolbar
              schema={schema}
              resourceId={resource.id}
              isDraft={isDraft}
            />
          </Stack>
        </Stack>
        <Box sx={{ outline: '1px solid lime', p: 4 }}>
          <Box color={'lime'}>Call To Action</Box>
          <Box>
            <Button
              color="secondary"
              size="large"
              sx={{ height: 'fit-content', fontSize: '1.2em' }}
              endIcon={<AddLink />}
            >
              Match Order
            </Button>
            <Button
              color="secondary"
              size="large"
              sx={{ height: 'fit-content', fontSize: '1.2em' }}
              endIcon={<ArrowRight />}
            >
              Submit
            </Button>
            <Button
              color="secondary"
              size="large"
              sx={{ height: 'fit-content', fontSize: '1.2em' }}
              endIcon={<ArrowRight />}
            >
              Approve
            </Button>
            <Button
              color="secondary"
              size="large"
              sx={{ height: 'fit-content', fontSize: '1.2em' }}
              endIcon={<ArrowRight />}
            >
              Confirm Payment
            </Button>
          </Box>
        </Box>
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
  )
}
