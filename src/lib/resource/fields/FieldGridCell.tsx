'use client'

import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid'
import Field from './Field'
import { UpdateValueDto } from '@/domain/resource/fields/actions'
import { Field as FieldModel } from '@/domain/schema/types'
import { Resource } from '@/domain/resource/types'

type Props = {
  cellParams: GridRenderEditCellParams<Resource>
  field: FieldModel
}

export default function FieldGridCell({ cellParams, field }: Props) {
  const currentField = cellParams.row.fields.find(
    (rf) => rf.fieldId === cellParams.field,
  )
  const apiRef = useGridApiContext()
  //TODO: focus input on mount to prevent additional click to edit

  if (!currentField) return
  const { value, fieldId } = currentField
  const resourceId = cellParams.row.id
  const inputId = `${cellParams.row.id}${fieldId}`

  const handleChange = (value: UpdateValueDto['value']) => {
    apiRef.current.setEditCellValue({
      id: cellParams.id,
      field: cellParams.field,
      value,
      debounceMs: 200,
    })
  }

  return (
    <Field
      field={field}
      inputId={inputId}
      onChange={handleChange}
      resourceId={resourceId}
      value={value}
      inline
      isReadOnly
    />
  )
}
