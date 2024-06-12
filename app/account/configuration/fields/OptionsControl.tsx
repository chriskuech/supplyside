'use client'

import { fail } from 'assert'
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
import { faker } from '@faker-js/faker'
import { P, match } from 'ts-pattern'
import { OptionPatch } from './actions'

type Props = {
  values: OptionPatch[]
  onChange: (values: OptionPatch[]) => void
}

export default function OptionsControl({ values, onChange }: Props) {
  const optionNames = new Set(...values.map((v) => v.name))

  return (
    <Autocomplete<OptionPatch, true, boolean, true>
      multiple
      freeSolo
      options={[]}
      value={values}
      getOptionLabel={(o) => (typeof o === 'string' ? o : o.name)}
      onChange={(e, nameOrValues, reason) =>
        match(reason)
          .with('createOption', () =>
            onChange(
              nameOrValues.map((nameOrValue) =>
                match<string | OptionPatch, OptionPatch>(nameOrValue)
                  .with(P.string, (name) => ({
                    id: faker.string.uuid(),
                    name,
                    op: 'add',
                  }))
                  .with(P.any, (o) => o)
                  .exhaustive(),
              ),
            ),
          )
          .with('clear', () => {
            onChange(
              values.flatMap((value) =>
                match<OptionPatch, OptionPatch[]>(value)
                  .with({ op: 'add' }, () => [])
                  .with(P.any, (o) => [
                    {
                      id: o.id,
                      optionId: o.optionId,
                      name: o.name,
                      op: 'remove',
                    },
                  ])
                  .exhaustive(),
              ),
            )
          })
          .otherwise(() => {})
      }
      renderTags={(values) => (
        <SortableChips values={values} onChange={onChange} />
      )}
      renderInput={(params: AutocompleteRenderInputParams) => {
        const invalid =
          typeof params.inputProps.value === 'string' &&
          optionNames.has(params.inputProps.value)
        return (
          <TextField
            {...params}
            label="Options"
            placeholder="Option name"
            error={invalid}
            helperText={
              invalid && 'Option names must be unique within a field.'
            }
            onKeyDown={(e) =>
              invalid && e.key === 'Enter' && e.stopPropagation()
            }
          />
        )
      }}
    />
  )
}

const SortableChip: FC<{
  value: OptionPatch
  onRemove: (op: OptionPatch) => void
}> = ({ value, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: value.id })

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
        key={value.id}
        label={value.name}
        onDelete={() => onRemove(value)}
      />
    </Box>
  )
}

const SortableChips: FC<{
  values: OptionPatch[]
  onChange: (values: OptionPatch[]) => void
}> = ({ values, onChange }) => {
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!active || !over || active.id === over.id) return

        const removed = values.filter((v) => v.id !== active.id)
        const i = values.findIndex((v) => v.id === over.id)

        onChange([
          ...removed.slice(0, i),
          values.find((v) => v.id === active.id) ?? fail(),
          ...removed.slice(i),
        ])
      }}
    >
      <SortableContext items={values} strategy={rectSortingStrategy}>
        <Stack direction={'row'} spacing={1} flexWrap={'wrap'}>
          {values
            .filter((v) => v.op !== 'remove')
            .map((value) => (
              <SortableChip
                key={value.id}
                value={value}
                onRemove={(value) =>
                  onChange([
                    ...values.filter((v) => v.id !== value.id),
                    ...match(value)
                      .with({ op: 'add' }, () => [])
                      .otherwise((value): OptionPatch[] => [
                        {
                          id: value.id,
                          name: value.name,
                          op: 'remove',
                          optionId: value.optionId,
                        },
                      ]),
                  ])
                }
              />
            ))}
        </Stack>
      </SortableContext>
    </DndContext>
  )
}
