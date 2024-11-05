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
import { syncFromAttachments } from '@/actions/job'

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
    resource={resource}
    resourceType="Job"
    onSync={() => syncFromAttachments(resource.id)}
    field={selectSchemaFieldUnsafe(schema, fields.jobAttachments)}
    value={selectResourceFieldValue(resource, fields.jobAttachments)}
    fontSize={fontSize}
  />
)
