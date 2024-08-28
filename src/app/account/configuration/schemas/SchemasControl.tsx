import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import AddSectionControl from './AddSectionControl'
import { Schema } from './actions'
import SchemaSectionsControl from './SchemaSectionsControl'
import { Field } from '@/domain/configuration/fields/actions'

type Props = {
  fields: Field[]
  schemas: Schema[]
}

export default function SchemasControl({ fields, schemas }: Props) {
  return (
    <>
      {schemas.map((schema) => (
        <Accordion key={schema.id}>
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
