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
    resource={resource}
    resourceType="Bill"
    fontSize={fontSize}
    onSync={() => syncFromAttachments(resource.id)}
    field={selectSchemaFieldUnsafe(schema, fields.billAttachments)}
    value={selectResourceFieldValue(resource, fields.billAttachments)}
  />
)
