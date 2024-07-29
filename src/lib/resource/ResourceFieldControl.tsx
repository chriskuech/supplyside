import dynamic from 'next/dynamic'
import { Resource } from '@/domain/resource/types'
import { Schema } from '@/domain/schema/types'

const FieldControl = dynamic(() => import('./fields/FieldControl'))

type Props = {
  resource: Resource
  schema: Schema
  fieldTemplateId: string
  isReadOnly?: boolean
}

export default function ResourceFieldControl({
  schema,
  resource,
  fieldTemplateId,
  isReadOnly,
}: Props) {
  const field = schema.allFields.find((f) => f.templateId === fieldTemplateId)

  if (!field) return '❌ Field not found'

  return (
    <FieldControl
      inputId={`rf-${field.id}`}
      resourceId={resource.id}
      field={field}
      value={resource.fields.find((rf) => rf.fieldId === field.id)?.value}
      isReadOnly={isReadOnly}
    />
  )
}
