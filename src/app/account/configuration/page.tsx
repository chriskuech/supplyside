import dynamic from 'next/dynamic'
import { Box, Container, Stack, Typography } from '@mui/material'
import {
  createField,
  deleteField,
  readFields,
  updateField,
} from './fields/actions'
import {
  createSection,
  deleteSection,
  readSchemas,
  updateSchema,
  updateSection,
} from './schemas/actions'

const FieldsTable = dynamic(() => import('./fields/FieldsTable'), {
  ssr: false,
})
const AddFieldButton = dynamic(() => import('./fields/AddFieldButton'), {
  ssr: false,
})
const SchemasControl = dynamic(() => import('./schemas/SchemasControl'), {
  ssr: false,
})

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
              <AddFieldButton onSubmit={createField} />
            </Stack>
            <Typography variant={'caption'}>
              Add, update, and remove Fields to be referenced in your Schemas.
            </Typography>
          </Box>
          <FieldsTable
            fields={fields}
            onUpdate={updateField}
            onDelete={deleteField}
          />
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
            <SchemasControl
              fields={fields}
              schemas={schemas}
              onCreateSection={createSection}
              onDeleteSection={deleteSection}
              onUpdateSection={updateSection}
              onUpdateSchema={updateSchema}
            />
          </Box>
        </Stack>
      </Stack>
    </Container>
  )
}
