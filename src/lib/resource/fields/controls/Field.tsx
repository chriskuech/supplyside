'use client'

import { fail } from 'assert'
import {
  Autocomplete,
  Checkbox,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { match } from 'ts-pattern'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Close } from '@mui/icons-material'
import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { debounce } from 'remeda'
import ContactField from './ContactField'
import FileField from './FileField'
import UserField from './UserField'
import ResourceField from './ResourceField'
import FilesField from './FilesField'
import { SchemaField } from '@/domain/schema/entity'
import {
  ResourceField as TResourceField,
  Value,
} from '@/domain/resource/entity'
import { findTemplateField } from '@/domain/schema/template/system-fields'
import { emptyValue } from '@/domain/resource/entity'

export type Props = {
  inputId: string
  resourceId: string
  schemaField: SchemaField
  resourceField: TResourceField | undefined
  onChange: (value: TResourceField) => void
  inline?: boolean
  withoutDebounce?: boolean
}

function Field(
  {
    inputId,
    resourceId,
    schemaField,
    resourceField: incomingResourceField,
    onChange: incomingOnChange,
    inline,
    withoutDebounce,
  }: Props,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const [resourceField, setResourceField] = useState<
    TResourceField | undefined
  >(incomingResourceField)

  const onChangeDebounced = useMemo(
    () => debounce(incomingOnChange, { timing: 'trailing', waitMs: 500 }).call,
    [incomingOnChange],
  )

  const handleChange = useCallback(
    (value: Value) => {
      const newResourceField: TResourceField = resourceField
        ? {
            ...resourceField,
            value,
            updatedAt: new Date(),
          }
        : {
            fieldId: schemaField.id,
            fieldType: schemaField.type,
            templateId: schemaField.templateId,
            valueId: null,
            value,
            updatedAt: new Date(),
          }
      setResourceField(newResourceField)

      if (withoutDebounce) {
        incomingOnChange(newResourceField)
      } else {
        onChangeDebounced(newResourceField)
      }
    },
    [
      resourceField,
      schemaField.id,
      schemaField.type,
      schemaField.templateId,
      withoutDebounce,
      incomingOnChange,
      onChangeDebounced,
    ],
  )

  useEffect(() => {
    if (
      incomingResourceField &&
      (!resourceField ||
        incomingResourceField.updatedAt > resourceField.updatedAt)
    ) {
      setResourceField(incomingResourceField)
    }
  }, [incomingResourceField, resourceField])

  dayjs.extend(utc)

  return match(schemaField.type)
    .with('Checkbox', () => (
      <Checkbox
        inputRef={ref}
        id={inputId}
        checked={resourceField?.value?.boolean ?? false}
        onChange={(e) =>
          handleChange({ ...emptyValue, boolean: e.target.checked })
        }
      />
    ))
    .with('Contact', () => (
      <ContactField
        contact={resourceField?.value?.contact ?? null}
        onChange={(contact) => handleChange({ ...emptyValue, contact })}
        inline={inline}
      />
    ))
    .with('Date', () => (
      <DatePicker
        inputRef={ref}
        sx={{ width: '100%' }}
        slotProps={{
          field: {
            clearable: true,
            onClear: () => handleChange({ ...emptyValue, date: null }),
          },
        }}
        value={
          resourceField?.value?.date && dayjs.utc(resourceField.value.date)
        }
        onChange={(value) =>
          handleChange({ ...emptyValue, date: value?.toDate() ?? null })
        }
      />
    ))
    .with('File', () => (
      <FileField
        resourceId={resourceId}
        fieldId={schemaField.id}
        file={resourceField?.value?.file ?? null}
        onChange={(file) => handleChange({ ...emptyValue, file })}
      />
    ))
    .with('Files', () => (
      <FilesField
        files={resourceField?.value?.files ?? []}
        onChange={(files) => handleChange({ ...emptyValue, files })}
      />
    ))
    .with('Money', () => (
      <TextField
        inputRef={ref}
        id={inputId}
        fullWidth
        type="number"
        value={resourceField?.value?.number ?? ''}
        onChange={(e) =>
          handleChange({ ...emptyValue, number: parseFloat(e.target.value) })
        }
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
      />
    ))
    .with('MultiSelect', () => (
      <Autocomplete
        id={inputId}
        multiple
        fullWidth
        getOptionLabel={(o) => o.name}
        getOptionKey={(o) => o.id}
        renderInput={(props) => <TextField inputRef={ref} {...props} />}
        options={schemaField.options.filter(
          (fieldOption) =>
            !resourceField?.value?.options?.some(
              (valueOption) => fieldOption.id === valueOption.id,
            ),
        )}
        defaultValue={schemaField.options.filter((fieldOption) =>
          resourceField?.value?.options?.some(
            (valueOption) => fieldOption.id === valueOption.id,
          ),
        )}
        onChange={(e, options) => handleChange({ ...emptyValue, options })}
      />
    ))
    .with('Number', () => (
      <TextField
        inputRef={ref}
        id={inputId}
        type="number"
        value={resourceField?.value?.number ?? ''}
        onChange={(e) =>
          handleChange({ ...emptyValue, number: parseFloat(e.target.value) })
        }
        InputProps={{
          startAdornment: findTemplateField(schemaField.templateId)?.prefix && (
            <InputAdornment position="start">
              {findTemplateField(schemaField.templateId)?.prefix}
            </InputAdornment>
          ),
        }}
      />
    ))
    .with('Select', () => (
      <Select
        inputRef={ref}
        id={inputId}
        fullWidth
        displayEmpty
        value={resourceField?.value?.option?.id ?? ''}
        onChange={(e) => {
          const option =
            schemaField.options.find((o) => o.id === e.target.value) ?? null

          handleChange({ ...emptyValue, option })
        }}
        endAdornment={
          resourceField?.value?.option?.id && (
            <IconButton
              onClick={() => handleChange({ ...emptyValue, option: null })}
              sx={{ marginRight: 2 }}
            >
              <Close fontSize="small" />
            </IconButton>
          )
        }
      >
        <MenuItem value="">-</MenuItem>
        {schemaField.options.map((o) => (
          <MenuItem key={o.id} value={o.id}>
            {o.name}
          </MenuItem>
        ))}
      </Select>
    ))
    .with('Text', () => (
      <TextField
        inputRef={ref}
        id={inputId}
        fullWidth
        value={resourceField?.value?.string ?? ''}
        onChange={(e) =>
          handleChange({ ...emptyValue, string: e.target.value })
        }
      />
    ))
    .with('Textarea', () => (
      <TextField
        inputRef={ref}
        id={inputId}
        multiline
        minRows={inline ? 1 : 3}
        fullWidth
        value={resourceField?.value?.string ?? ''}
        onChange={(e) =>
          handleChange({ ...emptyValue, string: e.target.value })
        }
      />
    ))
    .with('User', () => (
      <UserField
        ref={ref}
        inputId={inputId}
        user={resourceField?.value?.user ?? null}
        onChange={(user) => handleChange({ ...emptyValue, user })}
      />
    ))
    .with('Resource', () => (
      <ResourceField
        ref={ref}
        onChange={(resource) => handleChange({ ...emptyValue, resource })}
        resourceType={schemaField.resourceType ?? fail()}
        resource={resourceField?.value?.resource ?? null}
      />
    ))
    .exhaustive()
}

export default forwardRef(Field)
