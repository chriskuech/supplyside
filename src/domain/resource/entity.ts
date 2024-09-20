import { ResourceType, Cost, FieldType } from '@prisma/client'
import { File } from '../files/types'
import { User } from '../user/entity'
import { Option } from '../schema/entity'

export type Resource = {
  id: string
  templateId: string | null
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
  address: null,
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
  updatedAt: new Date(0),
} as const satisfies Value

export type Value = {
  address: Address | null
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
  updatedAt: Date
}

export type Address = {
  streetAddress: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
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
  templateId: string | null
  name: string
  key: number
}
