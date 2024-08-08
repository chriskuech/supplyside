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
  Typography,
} from '@mui/material'
import { match } from 'ts-pattern'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Close } from '@mui/icons-material'
import FileField from './FileField'
import UserField from './UserField'
import ResourceField from './ResourceField'
import ContactField from './ContactField'
import ContactCard from './ContactCard'
import FilesField from './FilesField'
import { UpdateValueDto, updateContact } from '@/domain/resource/fields/actions'
import { Field as FieldModel } from '@/domain/schema/types'
import { Value } from '@/domain/resource/values/types'

export type Props = {
  inputId: string
  resourceId: string
  field: FieldModel
  value: Value | undefined
  isReadOnly?: boolean
  onChange: (value: UpdateValueDto['value']) => void
  onUncontrolledChange?: () => void
  inline?: boolean
}

export default function Field({
  inputId,
  resourceId,
  field,
  value,
  isReadOnly,
  onChange,
  onUncontrolledChange,
  inline,
}: Props) {
  dayjs.extend(utc)

  return match(field.type)
    .with('Checkbox', () => (
      <Checkbox
        id={inputId}
        readOnly={isReadOnly}
        defaultChecked={value?.boolean ?? false}
        onChange={(e) => onChange({ boolean: e.target.checked })}
      />
    ))
    .with('Contact', () =>
      isReadOnly ? (
        <ContactCard contact={value?.contact ?? null} inline={inline} />
      ) : (
        <ContactField
          contact={value?.contact ?? null}
          onChange={(contact) => {
            updateContact(resourceId, field.id, contact)
            onUncontrolledChange?.()
          }}
          inline={inline}
        />
      ),
    )
    .with('Date', () => (
      <DatePicker
        sx={{ width: '100%' }}
        slotProps={{
          field: {
            clearable: true,
            onClear: () => onChange({ date: null }),
          },
        }}
        readOnly={isReadOnly}
        defaultValue={value?.date && dayjs.utc(value.date)}
        onChange={(value) => onChange({ date: value?.toDate() ?? null })}
      />
    ))
    .with('File', () => (
      <FileField
        resourceId={resourceId}
        value={value}
        field={field}
        isReadOnly={isReadOnly}
        onChange={onUncontrolledChange}
      />
    ))
    .with('Files', () => (
      <FilesField
        resourceId={resourceId}
        value={value}
        field={field}
        isReadOnly={isReadOnly}
        onChange={onUncontrolledChange}
      />
    ))
    .with('Money', () =>
      isReadOnly ? (
        <Typography>{value?.number}</Typography>
      ) : (
        <TextField
          id={inputId}
          fullWidth
          type="number"
          defaultValue={value?.number}
          onChange={(e) => onChange({ number: parseFloat(e.target.value) })}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />
      ),
    )
    .with('MultiSelect', () => (
      <Autocomplete
        id={inputId}
        multiple
        readOnly={isReadOnly}
        fullWidth
        getOptionLabel={(o) => o.name}
        getOptionKey={(o) => o.id}
        renderInput={(props) => <TextField {...props} />}
        options={field.options}
        defaultValue={field.options.filter((option) =>
          value?.options?.some((valueOption) => valueOption.id === option.id),
        )}
        onChange={(e, options) =>
          onChange({ optionIds: options.map((o) => o.id) })
        }
      />
    ))
    .with('Number', () =>
      isReadOnly ? (
        <Typography>{value?.number}</Typography>
      ) : (
        <TextField
          id={inputId}
          type="number"
          defaultValue={value?.number}
          onChange={(e) => onChange({ number: parseFloat(e.target.value) })}
        />
      ),
    )
    .with('Select', () => (
      <Select
        id={inputId}
        fullWidth
        displayEmpty
        readOnly={isReadOnly}
        value={value?.option?.id ?? ''}
        onChange={(e) => onChange({ optionId: e.target.value || null })}
        endAdornment={
          value?.option && (
            <IconButton
              onClick={() => onChange({ optionId: null })}
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
    .with('Text', () =>
      isReadOnly ? (
        <Typography>{value?.string}</Typography>
      ) : (
        <TextField
          id={inputId}
          fullWidth
          defaultValue={value?.string}
          onChange={(e) => onChange({ string: e.target.value })}
        />
      ),
    )
    .with('Textarea', () =>
      isReadOnly ? (
        <Typography whiteSpace={'pre'}>{value?.string}</Typography>
      ) : (
        <TextField
          id={inputId}
          multiline
          minRows={inline ? 1 : 3}
          fullWidth
          defaultValue={value?.string ?? ''}
          onChange={(e) => onChange({ string: e.target.value })}
        />
      ),
    )
    .with('User', () =>
      isReadOnly ? (
        <Typography>{value?.user && value.user.fullName}</Typography>
      ) : (
        <UserField
          inputId={inputId}
          userId={value?.user?.id}
          onChange={(userId) => onChange({ userId })}
        />
      ),
    )
    .with('Resource', () => (
      <ResourceField
        value={value?.resource ?? null}
        onChange={(resourceId) => onChange({ resourceId })}
        resourceType={field.resourceType ?? fail()}
        isReadOnly={isReadOnly}
      />
    ))
    .exhaustive()
}
