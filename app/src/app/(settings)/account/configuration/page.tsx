import { Alert, Box, Container, Stack, Typography } from '@mui/material'
import SchemasControl from './schemas/SchemasControl'
import AddFieldButton from './fields/AddFieldButton'
import FieldsTable from './fields/FieldsTable'
import { readFields } from '@/client/field'
import { requireSession } from '@/session'
import { readCustomSchemas } from '@/client/schema'

export default async function Configuration() {
  const { accountId } = await requireSession()
  const [fields, schemas] = await Promise.all([
    readFields(accountId),
    readCustomSchemas(accountId),
  ])

  if (!fields || !schemas) return <Alert severity="error">Failed to load</Alert>

  return (
    <Container maxWidth="md" sx={{ marginY: 5 }}>
      <Stack spacing={5} direction="column" textAlign="left">
        <Box>
          <Typography variant="h4">Configuration</Typography>
          <Typography variant="caption">
            Customize the schemas for your data.
          </Typography>
        </Box>
        <Stack spacing={2}>
          <Box>
            <Stack flexDirection="row">
              <Typography variant="h5" sx={{ flexGrow: 1 }}>
                Fields
              </Typography>
              <AddFieldButton />
            </Stack>
            <Typography variant="caption">
              Add, update, and remove Fields to be referenced in your Schemas.
            </Typography>
          </Box>
          <FieldsTable fields={fields} />
        </Stack>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h5">Schema</Typography>
            <Typography variant="caption">
              Modify the schema of your data. Schemas are comprised of Sections
              that appear as accordions on their respective pages. Sections can
              be drag-and-drop repurchased within a Schema, and Fields can be
              drag-and-drop repurchased within a Section.
            </Typography>
          </Box>
          <Box>
            <SchemasControl fields={fields} schemas={schemas} />
          </Box>
        </Stack>
      </Stack>
    </Container>
  )
}
