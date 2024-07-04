'use server'

import { readSchema } from '../schema/actions'
import Field from './fields/Field'
import { Resource } from '@/domain/resource/types'

type Props = {
  resource: Resource
  fieldTemplateId: string
}

export default async function ResourceFieldControl({
  resource,
  fieldTemplateId,
}: Props) {
  const systemSchema = await readSchema({
    resourceType: resource.type,
    isSystem: true,
  })

  const field = systemSchema.fields.find(
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
    />
  )
}
