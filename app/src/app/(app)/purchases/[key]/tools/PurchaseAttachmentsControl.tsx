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
  fontSize: 'small' | 'medium' | 'large'
}

export const PurchaseAttachmentsControl: FC<Props> = ({
  schema,
  resource,
  fontSize,
}) => (
  <AttachmentsToolbarControl
    resource={resource}
    resourceType="Purchase"
    onSync={() => syncFromAttachments(resource.id)}
    field={selectSchemaFieldUnsafe(schema, fields.purchaseAttachments)}
    value={selectResourceFieldValue(resource, fields.purchaseAttachments)}
    fontSize={fontSize}
  />
)
