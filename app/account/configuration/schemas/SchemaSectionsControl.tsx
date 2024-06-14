'use client'

import { useSortable } from '@dnd-kit/sortable'
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  Typography,
} from '@mui/material'
import { CSS } from '@dnd-kit/utilities'
import { Delete } from '@mui/icons-material'
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
import { Field, Schema, Section } from './actions'
import SectionFieldsControl from './SectionFieldsControl'

type Props = {
  fields: Field[]
  schema: Schema
  onUpdateSchema: (dto: { schemaId: string; sectionIds: string[] }) => void
  onUpdateSection: (dto: {
    sectionId: string
    name: string
    fieldIds: string[]
  }) => void
  onDeleteSection: (sectionId: string) => void
}

export default function SchemaSectionsControl({
  fields,
  schema,
  onUpdateSchema,
  onUpdateSection,
  onDeleteSection,
}: Props) {
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

  const sectionIds = schema.Section.map((s) => s.id)

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

          onUpdateSchema({
            schemaId: schema.id,
            sectionIds: [...removed.slice(0, i), activeId, ...removed.slice(i)],
          })
        }}
      >
        <SortableContext items={schema.Section} strategy={rectSortingStrategy}>
          {schema.Section.map((section) => (
            <Fragment key={section.id}>
              <Divider variant="fullWidth" />
              <SortableRow
                key={section.id}
                fields={fields}
                section={section}
                onUpdate={onUpdateSection}
                onRemove={onDeleteSection}
              />
            </Fragment>
          ))}
        </SortableContext>
      </DndContext>
    </List>
  )
}

const SortableRow: FC<{
  fields: Field[]
  section: Section
  onUpdate: (dto: {
    sectionId: string
    name: string
    fieldIds: string[]
  }) => void
  onRemove: (sectionId: string) => void
}> = ({ fields, section, onUpdate, onRemove }) => {
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
        <IconButton edge="end" onClick={() => onRemove(section.id)}>
          <Delete />
        </IconButton>
      }
    >
      <Box flexGrow={1}>
        <Typography>{section.name}</Typography>
      </Box>
      <SectionFieldsControl
        section={section}
        fields={fields}
        onChange={(fieldIds) => {
          onUpdate({
            sectionId: section.id,
            name: section.name,
            fieldIds,
          })
        }}
      />
    </ListItem>
  )
}
