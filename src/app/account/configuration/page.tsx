import { Box, Container, Stack, Typography } from '@mui/material'
import { readFields } from './fields/actions'
import { readSchemas } from './schemas/actions'
import SchemasControl from './schemas/SchemasControl'
import AddFieldButton from './fields/AddFieldButton'
import FieldsTable from './fields/FieldsTable'

export default async function Configuration() {
  const [fields, schemas] = await Promise.all([readFields(), readSchemas()])

  return (
    <Container maxWidth={'md'} sx={{ marginY: 5 }}>
      <Stack spacing={5} direction={'column'} textAlign={'left'}>
        <Box>
          <Typography variant={'h4'}>Configuration</Typography>
          <Typography variant={'caption'}>
            Customize the schemas for your data.
          </Typography>
        </Box>
        <Stack spacing={2}>
          <Box>
            <Stack flexDirection={'row'}>
              <Typography variant={'h5'} sx={{ flexGrow: 1 }}>
                Fields
              </Typography>
              <AddFieldButton />
            </Stack>
            <Typography variant={'caption'}>
              Add, update, and remove Fields to be referenced in your Schemas.
            </Typography>
          </Box>
          <FieldsTable fields={fields} />
        </Stack>
        <Stack spacing={2}>
          <Box>
            <Typography variant={'h5'}>Schema</Typography>
            <Typography variant={'caption'}>
              Modify the schema of your data. Schemas are comprised of Sections
              that appear as accordions on their respective pages. Sections can
              be drag-and-drop reordered within a Schema, and Fields can be
              drag-and-drop reordered within a Section.
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
