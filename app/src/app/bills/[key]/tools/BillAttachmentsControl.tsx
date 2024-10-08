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
}

export const BillAttachmentsControl: FC<Props> = ({ schema, resource }) => (
  <AttachmentsToolbarControl
    resourceId={resource.id}
    resourceType="Bill"
    onSync={() => syncFromAttachments(resource.id)}
    field={selectSchemaFieldUnsafe(schema, fields.billAttachments)}
    value={selectResourceFieldValue(resource, fields.billAttachments)}
  />
)
