'use client'

import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid'
import { FieldType } from '@prisma/client'
import Field from './Field'
import { UpdateValueDto } from '@/domain/resource/fields/actions'
import { Field as FieldModel } from '@/domain/schema/types'
import { Resource } from '@/domain/resource/types'

type Props = {
  cellParams: GridRenderEditCellParams<Resource>
  field: FieldModel
}
const AUTO_STOP_FIELD_TYPES: FieldType[] = ['Select', 'Resource', 'User']

export default function FieldGridEditCell({ cellParams, field }: Props) {
  const currentField = cellParams.row.fields.find(
    (rf) => rf.fieldId === cellParams.field,
  )
  const apiRef = useGridApiContext()
  //TODO: focus input on mount to prevent additional click to edit

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
    <Field
      field={field}
      inputId={`${cellParams.row.id}${field.id}`}
      onChange={handleChange}
      resourceId={cellParams.row.id}
      value={currentField?.value}
      inline
    />
  )
}
