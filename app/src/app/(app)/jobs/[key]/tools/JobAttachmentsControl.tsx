'use client'

import { FC } from 'react'
import { fields, Resource, SchemaData } from '@supplyside/model'
import AttachmentsToolbarControl from '@/lib/resource/detail/AttachmentsToolbarControl'
import { syncFromAttachments } from '@/actions/job'

type Props = {
  schemaData: SchemaData
  resource: Resource
  fontSize: 'small' | 'medium' | 'large'
}

export const JobAttachmentsControl: FC<Props> = ({
  schemaData,
  resource,
  fontSize,
}) => (
  <AttachmentsToolbarControl
    schemaData={schemaData}
    resource={resource}
    onSync={() => syncFromAttachments(resource.id)}
    field={fields.jobAttachments}
    fontSize={fontSize}
  />
)
