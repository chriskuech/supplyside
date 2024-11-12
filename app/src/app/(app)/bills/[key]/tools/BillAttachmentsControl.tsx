'use client'

import { FC } from 'react'
import { Schema, fields, Resource } from '@supplyside/model'
import AttachmentsToolbarControl from '@/lib/resource/detail/AttachmentsToolbarControl'
import { syncFromAttachments } from '@/actions/bill'

type Props = {
  schema: Schema
  resource: Resource
  fontSize: 'small' | 'medium' | 'large'
}

export const BillAttachmentsControl: FC<Props> = ({
  schema,
  resource,
  fontSize,
}) => (
  <AttachmentsToolbarControl
    schema={schema}
    resource={resource}
    fontSize={fontSize}
    onSync={() => syncFromAttachments(resource.id)}
    field={fields.billAttachments}
  />
)
