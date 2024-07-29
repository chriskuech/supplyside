import { Box, Container, Stack, Typography } from '@mui/material'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import ResourceFieldControl from '@/lib/resource/ResourceFieldControl'
import { fields } from '@/domain/schema/template/system-fields'
import { readResource } from '@/domain/resource/actions'
import { readSchema } from '@/domain/schema/actions'

export default async function VendorDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  const { accountId } = await requireSessionWithRedirect()
  const [resource, schema] = await Promise.all([
    readResource({ accountId, type: 'Vendor', key: Number(key) }),
    readSchema({ accountId, resourceType: 'Vendor' }),
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
          <ResourceFieldsControl resource={resource} schema={schema} />
        </Stack>
      </Stack>
    </Container>
  )
}
