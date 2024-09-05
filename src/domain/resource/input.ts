import { FieldType, ResourceType } from '@prisma/client'

export type ResourceInput = (
  | { id: string }
  | { type: ResourceType; key: number }
) & {
  accountId: string
  fields: ResourceFieldInput[]
}

export type ResourceFieldInput = (
  | { templateId: string }
  | { fieldId: string }
  | { name: string }
) & {
  fieldType: FieldType
  value: ValueInput
}

export type ValueOptionInput = { id: string }

export type ValueInput = {
  boolean?: boolean
  contact?: {
    name: string | null
    title: string | null
    email: string | null
    phone: string | null
  } | null
  date?: Date | null
  number?: number | null
  option?: ValueOptionInput | null
  options?: ValueOptionInput[]
  string?: string | null
  user?: { id: string } | null
  fileId?: string | null // This one's probably wrong if we are going to support previewing files before upload
  fileIds?: string[] | null
  resource?: { id: string } | null
}
