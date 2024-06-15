'use client'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material'
import { FC } from 'react'
import { ExpandMore } from '@mui/icons-material'
import AddSectionControl from './AddSectionControl'
import { Field, Schema } from './actions'
import SchemaSectionsControl from './SchemaSectionsControl'

type Props = {
  fields: Field[]
  schemas: Schema[]
  onDeleteSection: (sectionId: string) => void
  onCreateSection: (dto: { schemaId: string; name: string }) => void
  onUpdateSection: (dto: {
    sectionId: string
    name: string
    fieldIds: string[]
  }) => void
  onUpdateSchema: (dto: { schemaId: string; sectionIds: string[] }) => void
}

export default function SchemasControl({
  fields,
  schemas,
  onDeleteSection,
  onCreateSection,
  onUpdateSection,
  onUpdateSchema,
}: Props) {
  return (
    <>
      {schemas.map((schema) => (
        <SchemaControl
          key={schema.id}
          schema={schema}
          onCreateSection={onCreateSection}
          onUpdateSection={onUpdateSection}
          onDeleteSection={onDeleteSection}
          fields={fields}
          onUpdateSchema={onUpdateSchema}
        />
      ))}
    </>
  )
}

const SchemaControl: FC<{
  schema: Schema
  fields: Field[]
  onUpdateSchema: (dto: { schemaId: string; sectionIds: string[] }) => void
  onCreateSection: (dto: { schemaId: string; name: string }) => void
  onUpdateSection: (dto: {
    sectionId: string
    name: string
    fieldIds: string[]
  }) => void
  onDeleteSection: (sectionId: string) => void
}> = ({
  fields,
  schema,
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
  onUpdateSchema,
}) => (
  <Accordion key={schema.id}>
    <AccordionSummary expandIcon={<ExpandMore />}>
      <Typography variant="h6" gutterBottom>
        {schema.resourceType}
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      <AddSectionControl schema={schema} onAddSection={onCreateSection} />
      <SchemaSectionsControl
        fields={fields}
        schema={schema}
        onUpdateSchema={onUpdateSchema}
        onUpdateSection={onUpdateSection}
        onDeleteSection={onDeleteSection}
      />
    </AccordionDetails>
  </Accordion>
)
