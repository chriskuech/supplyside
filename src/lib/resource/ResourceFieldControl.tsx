'use server'

import dynamic from 'next/dynamic'
import { readSchema } from '../schema/actions'
import { Resource } from '@/domain/resource/types'

const Field = dynamic(() => import('./fields/Field'))

type Props = {
  resource: Resource
  fieldTemplateId: string
  isReadOnly?: boolean
}

export default async function ResourceFieldControl({
  resource,
  fieldTemplateId,
  isReadOnly,
}: Props) {
  const systemSchema = await readSchema({
    resourceType: resource.type,
    isSystem: true,
  })

  const field = systemSchema.allFields.find(
    (f) => f.templateId === fieldTemplateId,
  )

  if (!field) {
    return '❌ Field not found'
  }

  return (
    <Field
      inputId={`rf-${field.id}`}
      resourceId={resource.id}
      field={field}
      value={resource.fields.find((rf) => rf.fieldId === field.id)?.value}
      isReadOnly={isReadOnly}
    />
  )
}
