import { Box, Container, Stack, Typography } from '@mui/material'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import ResourceFieldControl from '@/lib/resource/ResourceFieldControl'
import { fields } from '@/domain/schema/template/system-fields'
import { readSchema } from '@/domain/schema/actions'
import { readResourceLatestRevision } from '@/domain/resource/actions'

export default async function VendorDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { accountId } = await requireSessionWithRedirect()
  const [schema, resource] = await Promise.all([
    readSchema({ accountId, resourceType: 'Vendor' }),
    readResourceLatestRevision({ accountId, type: 'Vendor', key: Number(key) }),
  ])

  return (
    <Container sx={{ my: 5 }}>
      <Stack spacing={5}>
        <Stack spacing={2}>
          <Stack>
            <Typography variant="overline">
              <span style={{ fontWeight: 100 }}>Vendor #</span>
              <span style={{ fontWeight: 700 }}>{key}</span>
            </Typography>
            <Box width={400}>
              <ResourceFieldControl
                schema={schema}
                resource={resource}
                fieldTemplateId={fields.name.templateId}
              />
            </Box>
          </Stack>
          <ResourceFieldsControl resource={resource} />
        </Stack>
      </Stack>
    </Container>
  )
}
