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
}

export const JobAttachmentsControl: FC<Props> = ({ schema, resource }) => (
  <AttachmentsToolbarControl
    resourceId={resource.id}
    resourceType="Job"
    // onSync={() => syncFromAttachments(resource.id)}
    field={selectSchemaFieldUnsafe(schema, fields.jobAttachments)}
    value={selectResourceFieldValue(resource, fields.jobAttachments)}
  />
)
