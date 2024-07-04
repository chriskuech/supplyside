'use server'

import { ResourceType } from '@prisma/client'
import { readSchema } from '../schema/actions'
import Field from './fields/Field'
import { readResource } from './actions'

type Props = {
  resourceType: ResourceType
  resourceId: string
  fieldTemplateId: string
}

export default async function ResourceFieldControl({
  resourceType,
  resourceId,
  fieldTemplateId,
}: Props) {
  const [systemSchema, resource] = await Promise.all([
    readSchema({ resourceType, isSystem: true }),
    readResource({ type: resourceType, id: resourceId }),
  ])

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
