'use client'

import { fail } from 'assert'
import {
  Autocomplete,
  Checkbox,
  InputAdornment,
  TextField,
} from '@mui/material'
import { match } from 'ts-pattern'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
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
import { Option, SchemaField } from '@/domain/schema/entity'
import { Value } from '@/domain/resource/entity'
import { findTemplateField } from '@/domain/schema/template/system-fields'
import { emptyValue } from '@/domain/resource/entity'

export type Props = {
  inputId: string
  resourceId: string
  field: SchemaField
  value: Value | undefined
  onChange: (value: Value) => void
  inline?: boolean
  withoutDebounce?: boolean
  disabled?: boolean
}

function Field(
  {
    inputId,
    resourceId,
    field,
    value: incomingValue,
    onChange: incomingOnChange,
    inline,
    withoutDebounce,
    disabled,
  }: Props,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const [value, setValue] = useState<Value | undefined>(incomingValue)

  const onChangeDebounced = useMemo(
    () => debounce(incomingOnChange, { timing: 'trailing', waitMs: 500 }).call,
    [incomingOnChange],
  )

  const handleChange = useCallback(
    (value: Value) => {
      const newValue = { ...value, updatedAt: new Date() }
      setValue(newValue)
      if (withoutDebounce) {
        incomingOnChange(newValue)
      } else {
        onChangeDebounced(newValue)
      }
    },
    [onChangeDebounced, withoutDebounce, incomingOnChange],
  )

  useEffect(() => {
    if (
      incomingValue &&
      (!value ||
        incomingValue.updatedAt > value.updatedAt ||
        value.resource?.name !== incomingValue.resource?.name)
    ) {
      setValue(incomingValue)
    }
  }, [incomingValue, value])

  dayjs.extend(utc)

  return match(field.type)
    .with('Checkbox', () => (
      <Checkbox
        disabled={disabled}
        inputRef={ref}
        id={inputId}
        checked={value?.boolean ?? false}
        onChange={(e) =>
          handleChange({ ...emptyValue, boolean: e.target.checked })
        }
      />
    ))
    .with('Contact', () => (
      <ContactField
        disabled
        contact={value?.contact ?? null}
        onChange={(contact) => handleChange({ ...emptyValue, contact })}
        inline={inline}
      />
    ))
    .with('Date', () => (
      <DatePicker
        disabled={disabled}
        inputRef={ref}
        sx={{ width: '100%' }}
        slotProps={{
          field: {
            clearable: true,
            onClear: () => handleChange({ ...emptyValue, date: null }),
          },
        }}
        value={value?.date && dayjs.utc(value.date)}
        onChange={(value) =>
          handleChange({ ...emptyValue, date: value?.toDate() ?? null })
        }
      />
    ))
    .with('File', () => (
      <FileField
        isReadOnly={disabled}
        resourceId={resourceId}
        fieldId={field.id}
        file={value?.file ?? null}
        onChange={(file) => handleChange({ ...emptyValue, file })}
      />
    ))
    .with('Files', () => (
      <FilesField
        isReadOnly={disabled}
        files={value?.files ?? []}
        onChange={(files) => handleChange({ ...emptyValue, files })}
      />
    ))
    .with('Money', () => (
      <TextField
        disabled={disabled}
        inputRef={ref}
        id={inputId}
        fullWidth
        type="number"
        value={value?.number ?? ''}
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
        disabled={disabled}
        id={inputId}
        multiple
        fullWidth
        getOptionLabel={(o) => o.name}
        getOptionKey={(o) => o.id}
        renderInput={(props) => <TextField inputRef={ref} {...props} />}
        options={field.options.filter(
          (fieldOption) =>
            !value?.options?.some(
              (valueOption) => fieldOption.id === valueOption.id,
            ),
        )}
        defaultValue={field.options.filter((fieldOption) =>
          value?.options?.some(
            (valueOption) => fieldOption.id === valueOption.id,
          ),
        )}
        onChange={(e, options) => handleChange({ ...emptyValue, options })}
      />
    ))
    .with('Number', () => (
      <TextField
        disabled={disabled}
        inputRef={ref}
        id={inputId}
        type="number"
        value={value?.number ?? ''}
        onChange={(e) =>
          handleChange({ ...emptyValue, number: parseFloat(e.target.value) })
        }
        InputProps={{
          startAdornment: findTemplateField(field.templateId)?.prefix && (
            <InputAdornment position="start">
              {findTemplateField(field.templateId)?.prefix}
            </InputAdornment>
          ),
        }}
      />
    ))
    .with('Select', () => (
      <Autocomplete<Option>
        disabled={disabled}
        options={field.options}
        id={inputId}
        fullWidth
        getOptionLabel={(option) => option.name}
        value={value?.option}
        onChange={(e, option) => {
          handleChange({ ...emptyValue, option })
        }}
        renderInput={(params) => <TextField inputRef={ref} {...params} />}
      />
    ))
    .with('Text', () => (
      <TextField
        disabled={disabled}
        inputRef={ref}
        id={inputId}
        fullWidth
        value={value?.string ?? ''}
        onChange={(e) =>
          handleChange({ ...emptyValue, string: e.target.value })
        }
      />
    ))
    .with('Textarea', () => (
      <TextField
        disabled={disabled}
        inputRef={ref}
        id={inputId}
        multiline
        minRows={inline ? 1 : 3}
        fullWidth
        value={value?.string ?? ''}
        onChange={(e) =>
          handleChange({ ...emptyValue, string: e.target.value })
        }
      />
    ))
    .with('User', () => (
      <UserField
        isReadOnly={disabled}
        ref={ref}
        inputId={inputId}
        user={value?.user ?? null}
        onChange={(user) => handleChange({ ...emptyValue, user })}
      />
    ))
    .with('Resource', () => (
      <ResourceField
        isReadOnly={disabled}
        ref={ref}
        onChange={(resource) => handleChange({ ...emptyValue, resource })}
        resourceType={field.resourceType ?? fail()}
        resource={value?.resource ?? null}
      />
    ))
    .exhaustive()
}

export default forwardRef(Field)
