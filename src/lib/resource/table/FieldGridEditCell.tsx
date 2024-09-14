'use client'

import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import { useLayoutEffect, useRef } from 'react'
import Field from '../fields/controls/Field'
import { Cell, Display, Row } from './types'
import { SchemaField as SchemaField } from '@/domain/schema/entity'
import { selectResourceField } from '@/domain/resource/extensions'

type Props = {
  cellParams: GridRenderEditCellParams<Row, Cell, Display>
  schemaField: SchemaField
}

export default function FieldGridEditCell({ cellParams, schemaField }: Props) {
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
        withoutDebounce
        ref={inputRef}
        schemaField={schemaField}
        inputId={`${cellParams.row.id}${schemaField.id}`}
        onChange={(value) => {
          apiRef.current.setEditCellValue({
            id: cellParams.id,
            field: cellParams.field,
            value,
            debounceMs: 200,
          })
        }}
        resourceId={cellParams.row.id}
        resourceField={selectResourceField(cellParams.row, {
          fieldId: schemaField.id,
        })}
        inline
      />
    </Box>
  )
}
