import { ResourceType, User } from '@prisma/client'
import { Option } from '../schema/types'

export type Resource = {
  id: string
  type: ResourceType
  key: number
  fields: ResourceField[]
}

export type ResourceField = {
  fieldId: string
  value: Value
}

export type Value = {
  boolean: boolean | null
  number: number | null
  option: Option | null
  options?: Option[]
  string: string | null
  user: User | null
}
