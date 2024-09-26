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
import { OptionPatch } from '@/domain/schema/SchemaFieldService'

type Props = {
  options: OptionPatch[]
  onChange: (values: OptionPatch[]) => void
  isDisabled?: boolean
  templateOptionIds: string[] | undefined
}

export default function OptionsControl({
  options,
  onChange,
  isDisabled,
  templateOptionIds,
}: Props) {
  // I think this is wrong considering a option { op: 'remove' } will still show up here
  const optionNames = new Set(options.map((v) => v.name))

  return (
    <Autocomplete<OptionPatch, true, boolean, true>
      multiple
      disabled={isDisabled}
      disableClearable={isDisabled || !!templateOptionIds?.length}
      freeSolo
      options={[]}
      value={options}
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
              options.flatMap((value) =>
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
        <SortableChips
          values={values}
          onChange={onChange}
          isDisabled={isDisabled}
          templateOptionIds={templateOptionIds}
        />
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
  isDisabled?: boolean
}> = ({ value, onRemove, isDisabled }) => {
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
        disabled={isDisabled}
        onDelete={() => onRemove(value)}
      />
    </Box>
  )
}

const SortableChips: FC<{
  values: OptionPatch[]
  onChange: (values: OptionPatch[]) => void
  isDisabled?: boolean
  templateOptionIds: string[] | undefined
}> = ({ values, onChange, isDisabled, templateOptionIds }) => {
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
        <Stack direction="row" gap={1} flexWrap="wrap">
          {values
            .filter((v) => v.op !== 'remove')
            .map((value) => (
              <SortableChip
                key={value.id}
                value={value}
                isDisabled={
                  isDisabled ||
                  templateOptionIds?.some((optionId) => optionId === value.id)
                }
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
