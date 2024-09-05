'use client'

import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid'
import { FieldType } from '@prisma/client'
import { Box } from '@mui/material'
import { useLayoutEffect, useRef } from 'react'
import Field from './Field'
import { UpdateValueDto } from '@/domain/resource/fields/actions'
import { Field as FieldModel } from '@/domain/schema/types'
import { Resource } from '@/domain/resource/entity'

type Props = {
  cellParams: GridRenderEditCellParams<Resource>
  field: FieldModel
}
const AUTO_STOP_FIELD_TYPES: FieldType[] = ['Select', 'Resource', 'User']

export default function FieldGridEditCell({ cellParams, field }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const currentField = cellParams.row.fields.find(
    (rf) => rf.fieldId === cellParams.field,
  )
  const apiRef = useGridApiContext()

  useLayoutEffect(() => {
    if (cellParams.hasFocus) {
      inputRef.current?.focus()
    }
  }, [cellParams.hasFocus])

  const handleChange = (value: UpdateValueDto['value']) => {
    apiRef.current.setEditCellValue({
      id: cellParams.id,
      field: cellParams.field,
      value,
      debounceMs: 200,
    })

    if (AUTO_STOP_FIELD_TYPES.includes(field.type)) {
      apiRef.current.stopCellEditMode({
        id: cellParams.id,
        field: cellParams.field,
      })
    }
  }

  return (
    <Box display="flex" width="100%" alignItems="center">
      <Field
        ref={inputRef}
        field={field}
        inputId={`${cellParams.row.id}${field.id}`}
        onChange={handleChange}
        resourceId={cellParams.row.id}
        value={currentField?.value}
        inline
      />
    </Box>
  )
}
