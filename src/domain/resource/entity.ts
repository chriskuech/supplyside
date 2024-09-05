import { ResourceType, FieldType, Cost, Contact, Option } from '@prisma/client'
import { P, match } from 'ts-pattern'

export type Resource = {
  id: string
  accountId: string
  type: ResourceType
  key: number
  fields: ResourceField[]
  costs: Cost[]
}

export type ResourceField = {
  fieldId: string
  fieldType: FieldType
  templateId: string | null
  name: string
  value: Value
}

export type Value = {
  boolean: boolean | null
  contact: Contact | null
  date: Date | null
  number: number | null
  option: Option | null
  options: Option[]
  string: string | null
  user: ValueUser | null
  file: ValueFile | null
  files: ValueFile[]
  resource: ValueResource | null
}

export type ValueFile = {
  id: string
  name: string
  blobId: string
  contentType: string
  previewPath: string
  downloadPath: string
}

export type ValueResource = {
  id: string
  name: string
  key: number
}

export type ValueUser = {
  id: string
  firstName: string | null
  lastName: string | null
  fullName: string | null
  email: string
  profilePicPath: string | null
}

type FieldRef = { templateId: string } | { fieldId: string } | { name: string }

export const selectValue = (
  resource: Resource,
  fieldRef: FieldRef,
): Value | undefined =>
  match<FieldRef, ResourceField | undefined>(fieldRef)
    .with({ templateId: P.string }, ({ templateId }) =>
      resource.fields.find((f) => f.templateId === templateId),
    )
    .with({ fieldId: P.string }, ({ fieldId }) =>
      resource.fields.find((f) => f.fieldId === fieldId),
    )
    .with({ name: P.string }, ({ name }) =>
      resource.fields.find((f) => f.name === name),
    )
    .exhaustive()?.value
