'use client'
import { fail } from 'assert'
import {
  Autocomplete,
  BaseTextFieldProps,
  Checkbox,
  FilledInputProps,
  InputAdornment,
  SlotProps,
  Stack,
  TextField,
} from '@mui/material'
import { match } from 'ts-pattern'
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc'
import {
  ElementType,
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { debounce } from 'remeda'
import {
  MCMASTER_CARR_NAME,
  Resource,
  SchemaField,
  Value,
  emptyValue,
  findTemplateField,
  resources,
} from '@supplyside/model'
import { Option } from '@supplyside/model'
import AddressField from './AddressField'
import ContactField from './ContactField'
import FileField from './FileField'
import UserField from './UserField'
import ResourceField from './ResourceField'
import FilesField from './FilesField'
import { McMasterCarrLogo } from '@/lib/ux/McMasterCarrLogo'

type InputProps = SlotProps<
  ElementType<FilledInputProps, keyof JSX.IntrinsicElements>,
  unknown,
  BaseTextFieldProps
>

export type Props = {
  inputId: string
  resource: Resource
  field: SchemaField
  value: Value | undefined
  onChange: (value: Value) => void
  inline?: boolean
  withoutDebounce?: boolean
  disabled?: boolean
  inputProps?: InputProps | undefined
  datePickerProps?: DatePickerProps<Dayjs, false> | undefined
}

function Field(
  {
    inputId,
    resource,
    field,
    value: incomingValue,
    onChange: incomingOnChange,
    inline,
    withoutDebounce,
    disabled,
    inputProps,
    datePickerProps,
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
      const newValue = { ...value, updatedAt: new Date().toISOString() }
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
    .with('Address', () => (
      <AddressField
        disabled={disabled}
        address={value?.address ?? null}
        onChange={(address) => handleChange({ ...emptyValue, address })}
        inline={inline}
      />
    ))
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
        disabled={disabled}
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
        value={value?.date ? dayjs.utc(value.date) : null}
        onChange={(value) =>
          handleChange({ ...emptyValue, date: value?.toISOString() ?? null })
        }
        {...datePickerProps}
      />
    ))
    .with('File', () => (
      <FileField
        isReadOnly={disabled}
        resourceId={resource.id}
        fieldId={field.fieldId}
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
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          },
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
            !value?.options.some(
              (valueOption) => fieldOption.id === valueOption.id,
            ),
        )}
        defaultValue={field.options.filter((fieldOption) =>
          value?.options.some(
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
        slotProps={{
          input: {
            startAdornment: findTemplateField(field.templateId)?.prefix && (
              <InputAdornment position="start">
                {findTemplateField(field.templateId)?.prefix}
              </InputAdornment>
            ),
            endAdornment: findTemplateField(field.templateId)?.suffix && (
              <InputAdornment position="end">
                {findTemplateField(field.templateId)?.suffix}
              </InputAdornment>
            ),
          },
        }}
      />
    ))
    .with('Resource', () => (
      <ResourceField
        resourceId={resource.id}
        isReadOnly={disabled}
        ref={ref}
        onChange={(resource) => handleChange({ ...emptyValue, resource })}
        resourceType={
          field.resourceType ?? fail('Resource type not found on Field')
        }
        valueResource={value?.resource ?? null}
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
        renderInput={(params) => (
          <Stack direction="row" alignItems="center">
            <TextField inputRef={ref} {...params} />
          </Stack>
        )}
      />
    ))
    .with('Text', () => {
      const isMcMasterCarr =
        resource.templateId === resources.mcMasterCarrVendor.templateId &&
        value?.string === MCMASTER_CARR_NAME

      return (
        <TextField
          disabled={disabled}
          inputRef={ref}
          id={inputId}
          fullWidth
          value={value?.string ?? ''}
          onChange={(e) =>
            handleChange({ ...emptyValue, string: e.target.value })
          }
          slotProps={{
            input: {
              ...inputProps,
              endAdornment: isMcMasterCarr ? (
                <InputAdornment position="end">
                  <McMasterCarrLogo />
                </InputAdornment>
              ) : null,
            },
          }}
        />
      )
    })
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
        slotProps={{
          input: inputProps,
        }}
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
    .exhaustive()
}

export default forwardRef(Field)
