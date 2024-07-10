import { Box, Container, Stack, Typography } from '@mui/material'
import { requireSessionWithRedirect } from '@/lib/session'
import ResourceFieldsControl from '@/lib/resource/ResourceFieldsControl'
import { readResource } from '@/lib/resource/actions'
import ResourceFieldControl from '@/lib/resource/ResourceFieldControl'
import { fields } from '@/domain/schema/template/system-fields'

export default async function VendorDetail({
  params: { key },
}: {
  params: { key: string }
}) {
  await requireSessionWithRedirect()
  const resource = await readResource({ type: 'Vendor', key: Number(key) })

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
