import dynamic from 'next/dynamic'
import {
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from '@mui/material'
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
const CreateFieldForm = dynamic(() => import('./fields/CreateFieldForm'), {
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
            <Typography variant={'h5'}>Fields</Typography>
            <Typography variant={'caption'}>
              Add, update, and remove Fields.
            </Typography>
          </Box>
          <Card sx={{ width: 'fit-content' }}>
            <CardContent>
              <Typography gutterBottom variant="h6">
                Create Field
              </Typography>
              <CreateFieldForm onSubmit={createField} />
            </CardContent>
          </Card>
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
              Add, update, and remove Schemas.
            </Typography>
          </Box>
          <SchemasControl
            fields={fields}
            schemas={schemas}
            onCreateSection={createSection}
            onDeleteSection={deleteSection}
            onUpdateSection={updateSection}
            onUpdateSchema={updateSchema}
          />
        </Stack>
      </Stack>
    </Container>
  )
}
