'use client'

import { FC } from 'react'
import { SchemaData, fields, Resource } from '@supplyside/model'
import AttachmentsToolbarControl from '@/lib/resource/detail/AttachmentsToolbarControl'
import { syncFromAttachments } from '@/actions/bill'

type Props = {
  schemaData: SchemaData
  resource: Resource
  fontSize: 'small' | 'medium' | 'large'
}

export const BillAttachmentsControl: FC<Props> = ({
  schemaData,
  resource,
  fontSize,
}) => (
  <AttachmentsToolbarControl
    schemaData={schemaData}
    resource={resource}
    fontSize={fontSize}
    onSync={() => syncFromAttachments(resource.id)}
    field={fields.billAttachments}
  />
)
