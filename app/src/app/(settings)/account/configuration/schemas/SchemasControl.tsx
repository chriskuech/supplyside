import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { SchemaData, SchemaFieldData } from '@supplyside/model'
import AddSectionControl from './AddSectionControl'
import SchemaSectionsControl from './SchemaSectionsControl'

type Props = {
  fields: SchemaFieldData[]
  schemas: SchemaData[]
}

export default function SchemasControl({ fields, schemas }: Props) {
  return (
    <>
      {schemas.map((schemaData) => (
        <Accordion key={schemaData.resourceType}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" gutterBottom>
              {schemaData.resourceType}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AddSectionControl schemaData={schemaData} />
            <SchemaSectionsControl fields={fields} schemaData={schemaData} />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  )
}
