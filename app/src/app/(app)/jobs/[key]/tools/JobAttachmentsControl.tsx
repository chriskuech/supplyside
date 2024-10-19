'use client'

import { FC } from 'react'
import {
  Schema,
  fields,
  selectResourceFieldValue,
  Resource,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import AttachmentsToolbarControl from '@/lib/resource/detail/AttachmentsToolbarControl'

type Props = {
  schema: Schema
  resource: Resource
  fontSize: 'small' | 'medium' | 'large'
}

export const JobAttachmentsControl: FC<Props> = ({
  schema,
  resource,
  fontSize,
}) => (
  <AttachmentsToolbarControl
    resourceId={resource.id}
    resourceType="Job"
    field={selectSchemaFieldUnsafe(schema, fields.jobAttachments)}
    value={selectResourceFieldValue(resource, fields.jobAttachments)}
    fontSize={fontSize}
  />
)
