'use client'

import { FC } from 'react'
import { Schema, fields, Resource } from '@supplyside/model'
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
    schema={schema}
    resource={resource}
    onSync={() => syncFromAttachments(resource.id)}
    field={fields.jobAttachments}
    fontSize={fontSize}
  />
)
