import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { Schema, SchemaField } from '@supplyside/model'
import AddSectionControl from './AddSectionControl'
import SchemaSectionsControl from './SchemaSectionsControl'

type Props = {
  fields: SchemaField[]
  schemas: Schema[]
}

export default function SchemasControl({ fields, schemas }: Props) {
  return (
    <>
      {schemas.map((schema) => (
        <Accordion key={schema.resourceType}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" gutterBottom>
              {schema.resourceType}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AddSectionControl schema={schema} />
            <SchemaSectionsControl fields={fields} schema={schema} />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  )
}
