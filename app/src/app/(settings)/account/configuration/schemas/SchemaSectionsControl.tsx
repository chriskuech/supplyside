'use client'
import { useSortable } from '@dnd-kit/sortable'
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  Stack,
  TextField,
} from '@mui/material'
import { CSS } from '@dnd-kit/utilities'
import { Clear } from '@mui/icons-material'
import { FC, Fragment } from 'react'
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { z } from 'zod'
import {
  ResourceType,
  SchemaData,
  SchemaField,
  Section,
} from '@supplyside/model'
import SectionFieldsControl from './SectionFieldsControl'
import { removeSection, updateSchema, updateSection } from '@/actions/schema'

type Props = {
  fields: SchemaField[]
  schemaData: SchemaData
}

export default function SchemaSectionsControl({ fields, schemaData }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const sectionIds = schemaData.sections.map((s) => s.id)

  return (
    <List>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) return

          const activeId = z.string().parse(active.id)
          const removed = sectionIds.filter(
            (sectionId) => sectionId !== activeId,
          )
          const i = sectionIds.findIndex((sectionId) => sectionId === over.id)

          updateSchema(schemaData.resourceType, [
            ...removed.slice(0, i),
            activeId,
            ...removed.slice(i),
          ])
        }}
      >
        <SortableContext
          items={schemaData.sections}
          strategy={rectSortingStrategy}
        >
          {schemaData.sections.map((section) => (
            <Fragment key={section.id}>
              <Divider variant="fullWidth" />
              <SortableRow
                key={section.id}
                resourceType={schemaData.resourceType}
                fields={fields}
                section={section}
              />
            </Fragment>
          ))}
        </SortableContext>
      </DndContext>
    </List>
  )
}

const SortableRow: FC<{
  resourceType: ResourceType
  fields: SchemaField[]
  section: Section
}> = ({ resourceType, fields, section }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: section.id })

  return (
    <ListItem
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: attributes['aria-pressed'] ? 'grabbing' : 'grab',
        display: 'flex',
        flexDirection: 'row',
      }}
      {...attributes}
      {...listeners}
      secondaryAction={
        <IconButton
          edge="end"
          onClick={() => removeSection(resourceType, section.id)}
          disabled={section.fields.some((field) => !!field.templateId)}
        >
          <Clear />
        </IconButton>
      }
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        width="100%"
        gap={2}
      >
        <Box>
          <TextField
            defaultValue={section.name}
            onChange={(e) =>
              updateSection(resourceType, section.id, {
                name: e.target.value,
                fieldIds: section.fields.map((f) => f.fieldId),
              })
            }
          />
        </Box>
        <SectionFieldsControl
          section={section}
          fields={fields}
          onChange={(fieldIds) => {
            updateSection(resourceType, section.id, { fieldIds })
          }}
        />
      </Stack>
    </ListItem>
  )
}
