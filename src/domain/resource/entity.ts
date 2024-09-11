import { ResourceType, Cost, FieldType } from '@prisma/client'
import { File } from '../files/types'
import { User } from '../user/entity'
import { Option } from '../schema/types'

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
  value: Value
}

export const emptyValue = {
  boolean: null,
  contact: null,
  date: null,
  number: null,
  option: null,
  string: null,
  user: null,
  file: null,
  resource: null,
  files: [],
  options: [],
} as const satisfies Value

export type Value = {
  boolean: boolean | null
  contact: Contact | null
  date: Date | null
  number: number | null
  option: Option | null
  options: Option[]
  string: string | null
  user: User | null
  file: File | null
  files: File[]
  resource: ValueResource | null
}

export type Contact = {
  name: string | null
  title: string | null
  email: string | null
  phone: string | null
}

export type ValueResource = {
  id: string
  type: ResourceType
  name: string
  key: number
}
