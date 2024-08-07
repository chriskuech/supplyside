import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { AddLink, ArrowRight } from '@mui/icons-material'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import { readResource } from '@/domain/resource/actions'
import { readSchema } from '@/domain/schema/actions'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import ResourceTable from '@/lib/resource/ResourceTable'
import ItemizedCostLines from '@/lib/resource/ItemizedCostLines'
import { readResources } from '@/domain/resource/actions'

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

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Typography variant="h3">
            <span style={{ opacity: 0.5 }}>Bill #</span>
            <span>{key}</span>
          </Typography>
          <ResourceFieldsControl schema={schema} resourceId={resource.id} />
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
        <Stack spacing={2}>
          <Stack direction={'row'} alignItems={'end'}>
            <Typography variant="h4" flexGrow={1}>
              Lines
            </Typography>
            <CreateResourceButton type={'Line'} data={{ Bill: resource.id }} />
          </Stack>
          <ResourceTable
            schema={lineSchema}
            resources={lineResources}
            isEditable
          />
          <Stack direction={'row'} justifyContent={'end'}>
            <Box width={'60%'}>
              <ItemizedCostLines resource={resource} />
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  )
}
