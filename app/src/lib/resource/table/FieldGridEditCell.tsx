'use client'

import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid'
import { Box } from '@mui/material'
import { useLayoutEffect, useRef } from 'react'
import { SchemaField } from '@supplyside/model'
import { selectResourceFieldValue } from '@supplyside/model'
import Field from '../fields/controls/Field'
import { Cell, Display, Row } from './types'

type Props = {
  cellParams: GridRenderEditCellParams<Row, Cell, Display>
  field: SchemaField
}

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
        withoutDebounce
        ref={inputRef}
        field={field}
        inputId={cellParams.row.id + field.fieldId}
        onChange={(value) =>
          apiRef.current.setEditCellValue({
            id: cellParams.id,
            field: cellParams.field,
            value,
            debounceMs: 200,
          })
        }
        resourceId={cellParams.row.id}
        value={selectResourceFieldValue(cellParams.row, field)}
        inline
      />
    </Box>
  )
}
