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
import { syncFromAttachments } from '@/actions/purchase'

type Props = {
  schema: Schema
  resource: Resource
}

export const PurchaseAttachmentsControl: FC<Props> = ({ schema, resource }) => (
  <AttachmentsToolbarControl
    resourceId={resource.id}
    resourceType="Purchase"
    onSync={() => syncFromAttachments(resource.id)}
    field={selectSchemaFieldUnsafe(schema, fields.purchaseAttachments)}
    value={selectResourceFieldValue(resource, fields.purchaseAttachments)}
  />
)
