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
import { faker } from '@faker-js/faker'
import { P, match } from 'ts-pattern'
import { OptionPatch } from './actions'

type Props = {
  label: string
  values: OptionPatch[]
  onChange: (values: OptionPatch[]) => void
}

export default function ReorderableAutocomplete({
  label,
  values,
  onChange,
}: Props) {
  return (
    <Autocomplete<OptionPatch, true, boolean, true>
      id="attribute-search"
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
      renderInput={(params: AutocompleteRenderInputParams) => (
        <TextField {...params} label={label} placeholder="Option name" />
      )}
    />
  )
}

const SortableItem: FC<{
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

        const item = values.find((v) => v.id === active.id)
        const removed = values.filter((v) => v.id !== active.id)
        const index = removed.findIndex((v) => v.id === over.id)

        if (!item) return

        onChange([...removed.slice(0, index), item, ...removed.slice(index)])
      }}
    >
      <SortableContext items={values} strategy={rectSortingStrategy}>
        <Stack direction={'row'} spacing={1} flexWrap={'wrap'}>
          {values
            .filter((v) => v.op !== 'remove')
            .map((value) => (
              <SortableItem
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
