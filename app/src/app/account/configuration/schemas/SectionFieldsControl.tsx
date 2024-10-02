'use client'
import Autocomplete, {
  AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
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
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Box, Stack, TextField } from '@mui/material'
import { FC } from 'react'
import { z } from 'zod'
import { isPlainObject } from 'remeda'
import { SchemaField, Section } from '@supplyside/model'

type Props = {
  fields: SchemaField[]
  section: Section
  onChange: (fieldIds: string[]) => void
}

export default function SectionFieldsControl({
  section,
  fields,
  onChange,
}: Props) {
  const fieldIds = new Set(section.fields.map((sf) => sf.fieldId))

  return (
    <Autocomplete<SchemaField, true, boolean, true>
      multiple
      disableClearable={fields
        .filter((f) => fieldIds.has(f.fieldId))
        .some((f) => !!f.templateId)}
      options={fields.filter((f) => !fieldIds.has(f.fieldId))}
      value={section.fields}
      getOptionLabel={(o) => (typeof o === 'string' ? o : o.name)}
      onChange={(e, values, reason) =>
        reason === 'clear'
          ? onChange([])
          : onChange(values.filter(isPlainObject).map((f) => f.fieldId))
      }
      renderTags={(fields) => (
        <SortableChips fields={fields} onChange={onChange} />
      )}
      renderInput={(params: AutocompleteRenderInputParams) => (
        <TextField
          {...params}
          label="Fields"
          helperText="Add, reorder, or remove Fields from this Section."
        />
      )}
    />
  )
}

const SortableChip: FC<{
  field: SchemaField
  onRemove: (fieldId: string) => void
}> = ({ field, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.fieldId })

  return (
    <Box
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: attributes['aria-pressed'] ? 'grabbing' : 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      <Chip
        key={field.fieldId}
        label={field.name}
        onDelete={
          !!field.templateId ? undefined : () => onRemove(field.fieldId)
        }
      />
    </Box>
  )
}

const SortableChips: FC<{
  fields: SchemaField[]
  onChange: (fieldIds: string[]) => void
}> = ({ fields, onChange }) => {
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

  const fieldIds = fields.map((f) => f.fieldId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return

        const activeId = z.string().parse(active.id)
        const removed = fieldIds.filter((fieldId) => fieldId !== activeId)
        const i = fieldIds.findIndex((fieldId) => fieldId === over.id)

        onChange([...removed.slice(0, i), activeId, ...removed.slice(i)])
      }}
    >
      <SortableContext
        items={fields.map((f) => ({ ...f, id: f.fieldId }))}
        strategy={rectSortingStrategy}
      >
        <Stack direction="row" gap={1} flexWrap="wrap">
          {fields.map((field) => (
            <SortableChip
              key={field.fieldId}
              field={field}
              onRemove={(fieldId) =>
                onChange(fieldIds.filter((fid) => fid !== fieldId))
              }
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  )
}
