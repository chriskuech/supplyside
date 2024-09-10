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
import { ForwardedRef, forwardRef } from 'react'
import ContactCard from '../views/ContactCard'
import ContactField from './ContactField'
import FileField from './FileField'
import UserField from './UserField'
import ResourceField from './ResourceField'
import FilesField from './FilesField'
import { Field as FieldModel } from '@/domain/schema/types'
import { Value } from '@/domain/resource/entity'
import { findTemplateField } from '@/domain/schema/template/system-fields'
import { emptyValue } from '@/domain/resource/entity'

export type Props = {
  inputId: string
  resourceId: string
  field: FieldModel
  value: Value | undefined
  isReadOnly?: boolean
  onChange: (value: Value) => void
  inline?: boolean
}

function Field(
  { inputId, resourceId, field, value, isReadOnly, onChange, inline }: Props,
  ref: ForwardedRef<HTMLInputElement>,
) {
  dayjs.extend(utc)

  return match(field.type)
    .with('Checkbox', () => (
      <Checkbox
        inputRef={ref}
        id={inputId}
        readOnly={isReadOnly}
        defaultChecked={value?.boolean ?? false}
        onChange={(e) => onChange({ ...emptyValue, boolean: e.target.checked })}
      />
    ))
    .with('Contact', () =>
      isReadOnly ? (
        value?.contact ? (
          <ContactCard contact={value.contact} inline={inline} />
        ) : (
          '-'
        )
      ) : (
        <ContactField
          contact={value?.contact ?? null}
          onChange={(contact) => onChange({ ...emptyValue, contact })}
          inline={inline}
        />
      ),
    )
    .with('Date', () => (
      <DatePicker
        inputRef={ref}
        sx={{ width: '100%' }}
        slotProps={{
          field: {
            clearable: true,
            onClear: () => onChange({ ...emptyValue, date: null }),
          },
        }}
        readOnly={isReadOnly}
        defaultValue={value?.date && dayjs.utc(value.date)}
        onChange={(value) =>
          onChange({ ...emptyValue, date: value?.toDate() ?? null })
        }
      />
    ))
    .with('File', () => (
      <FileField
        resourceId={resourceId}
        fieldId={field.id}
        file={value?.file ?? null}
        isReadOnly={isReadOnly}
        onChange={(file) => onChange({ ...emptyValue, file })}
      />
    ))
    .with('Files', () => (
      <FilesField
        files={value?.files ?? []}
        isReadOnly={isReadOnly}
        onChange={(files) => onChange({ ...emptyValue, files })}
      />
    ))
    .with('Money', () => (
      <TextField
        inputRef={ref}
        id={inputId}
        fullWidth
        type="number"
        defaultValue={value?.number}
        onChange={(e) =>
          onChange({ ...emptyValue, number: parseFloat(e.target.value) })
        }
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
        disabled={isReadOnly}
      />
    ))
    .with('MultiSelect', () => (
      <Autocomplete
        id={inputId}
        multiple
        readOnly={isReadOnly}
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
        onChange={(e, options) => onChange({ ...emptyValue, options })}
      />
    ))
    .with('Number', () => (
      <TextField
        inputRef={ref}
        id={inputId}
        type="number"
        defaultValue={value?.number}
        onChange={(e) =>
          onChange({ ...emptyValue, number: parseFloat(e.target.value) })
        }
        InputProps={{
          startAdornment: findTemplateField(field.templateId)?.prefix && (
            <InputAdornment position="start">
              {findTemplateField(field.templateId)?.prefix}
            </InputAdornment>
          ),
        }}
        disabled={isReadOnly}
      />
    ))
    .with('Select', () => (
      <Select
        inputRef={ref}
        id={inputId}
        fullWidth
        displayEmpty
        readOnly={isReadOnly}
        value={value?.option?.id ?? ''}
        onChange={(e) => {
          const option =
            field.options.find((o) => o.id === e.target.value) ?? null

          onChange({ ...emptyValue, option })
        }}
        endAdornment={
          value?.option?.id && (
            <IconButton
              onClick={() => onChange({ ...emptyValue, option: null })}
              sx={{ marginRight: 2 }}
            >
              <Close fontSize="small" />
            </IconButton>
          )
        }
      >
        <MenuItem value="">-</MenuItem>
        {field.options.map((o) => (
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
        defaultValue={value?.string}
        onChange={(e) => onChange({ ...emptyValue, string: e.target.value })}
        disabled={isReadOnly}
      />
    ))
    .with('Textarea', () => (
      <TextField
        inputRef={ref}
        id={inputId}
        multiline
        minRows={inline ? 1 : 3}
        fullWidth
        defaultValue={value?.string ?? ''}
        onChange={(e) => onChange({ ...emptyValue, string: e.target.value })}
        disabled={isReadOnly}
      />
    ))
    .with('User', () => (
      <UserField
        ref={ref}
        inputId={inputId}
        user={value?.user ?? null}
        onChange={(user) => onChange({ ...emptyValue, user })}
        isReadOnly={isReadOnly}
      />
    ))
    .with('Resource', () => (
      <ResourceField
        ref={ref}
        onChange={(resource) => onChange({ ...emptyValue, resource })}
        resourceType={field.resourceType ?? fail()}
        isReadOnly={isReadOnly}
        resource={value?.resource ?? null}
      />
    ))
    .exhaustive()
}

export default forwardRef(Field)
