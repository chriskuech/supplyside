'use client'

import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid'
import { FieldType } from '@prisma/client'
import { Box } from '@mui/material'
import { useLayoutEffect, useRef } from 'react'
import Field from '../fields/controls/Field'
import { Cell, Display, Row } from './types'
import { SchemaField as SchemaField } from '@/domain/schema/types'
import { selectResourceField } from '@/domain/resource/extensions'

type Props = {
  cellParams: GridRenderEditCellParams<Row, Cell, Display>
  field: SchemaField
}

const AUTO_STOP_FIELD_TYPES: FieldType[] = ['Select', 'Resource', 'User']

export default function FieldGridEditCell({ cellParams, field }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const apiRef = useGridApiContext()

  useLayoutEffect(() => {
    if (cellParams.hasFocus) {
      inputRef.current?.focus()
    }
  }, [cellParams.hasFocus])

  return (
    <Box display="flex" width="100%" alignItems="center">
      <Field
        ref={inputRef}
        field={field}
        inputId={`${cellParams.row.id}${field.id}`}
        onChange={(value) => {
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
        }}
        resourceId={cellParams.row.id}
        value={selectResourceField(cellParams.row, { fieldId: field.id })}
        inline
      />
    </Box>
  )
}
