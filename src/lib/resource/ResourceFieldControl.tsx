'use client'

import {
  Autocomplete,
  Checkbox,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  TextareaAutosize,
  Tooltip,
  Typography,
} from '@mui/material'
import { User } from '@prisma/client'
import { match } from 'ts-pattern'
import { Download, UploadFile } from '@mui/icons-material'
import { ChangeEvent, useRef } from 'react'
import { Value } from '@/domain/resource/types'
import { UpdateValueDto } from '@/domain/resource/fields/actions'
import { Field } from '@/domain/schema/types'

type Props = {
  id: string
  resourceId: string
  field: Field
  value: Value | undefined
  users: User[]
  onChange: (dto: UpdateValueDto) => void
}

export default function ResourceFieldControl({
  id,
  resourceId,
  field,
  value,
  users,
  onChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (dto: Omit<UpdateValueDto, 'resourceId' | 'fieldId'>) =>
    onChange({
      resourceId,
      fieldId: field.id,
      ...dto,
    })

  return match(field.type)
    .with('Checkbox', () => (
      <Checkbox
        id={id}
        value={value?.boolean}
        onChange={(e) => handleChange({ boolean: e.target.checked })}
      />
    ))
    .with('File', () => (
      <Stack direction={'row'}>
        <input
          style={{ display: 'none' }}
          type="file"
          ref={fileInputRef}
          onChange={async (e: ChangeEvent<HTMLInputElement>) => {
            const [file] = [...(e.target.files ?? [])]

            if (!file) return

            // uploadFile(
            //   resourceId,
            //   field.id,
            //   file.name,
            //   file.type,
            //   (await file.arrayBuffer()) satisfies NodeJS.TypedArray,
            // )
          }}
        />
        <Typography flexGrow={1}>{value?.file?.name ?? '-'}</Typography>
        {value?.file && (
          <Tooltip title="Download File">
            <IconButton
              onClick={() =>
                value.file &&
                window.open(
                  `/api/download/${encodeURIComponent(value.file.name)}?blobId=${value.file.blobId}`,
                )
              }
            >
              <Download />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Upload File">
          <IconButton onClick={() => fileInputRef.current?.click()}>
            <UploadFile />
          </IconButton>
        </Tooltip>
      </Stack>
    ))
    .with('Money', () => (
      <TextField
        id={id}
        type="number"
        value={value?.number}
        onChange={(e) => handleChange({ number: parseFloat(e.target.value) })}
        InputProps={{
          startAdornment: <InputAdornment position="start">$</InputAdornment>,
        }}
      />
    ))
    .with('MultiSelect', () => (
      <Autocomplete
        id={id}
        multiple
        fullWidth
        getOptionLabel={(o) => o.name}
        renderInput={(props) => <TextField {...props} />}
        options={field.options}
        value={value?.options}
      />
    ))
    .with('Number', () => (
      <TextField
        id={id}
        type="number"
        value={value?.number}
        onChange={(e) => handleChange({ number: parseFloat(e.target.value) })}
      />
    ))
    .with('RichText', () => (
      <TextareaAutosize
        id={id}
        value={value?.string ?? ''}
        onChange={(e) => handleChange({ string: e.target.value })}
      />
    ))
    .with('Select', () => (
      <Select
        id={id}
        value={value?.option?.id}
        onChange={(e) =>
          handleChange({ Option: { connect: { id: e.target.value } } })
        }
      >
        {field.options.map((o) => (
          <MenuItem key={o.id} value={o.id}>
            {o.name}
          </MenuItem>
        ))}
      </Select>
    ))
    .with('Text', () => (
      <TextField
        id={id}
        value={value?.string}
        onChange={(e) => handleChange({ string: e.target.value })}
      />
    ))
    .with('User', () => (
      <Select
        id={id}
        value={value?.user?.id}
        onChange={(e) =>
          handleChange({ User: { connect: { id: e.target.value } } })
        }
      >
        {users.map((u) => (
          <MenuItem key={u.id} value={u.id}>
            {u.firstName} {u.lastName}
          </MenuItem>
        ))}
      </Select>
    ))
    .with('Resource', () => <Typography>NYI</Typography>)
    .exhaustive()
}
