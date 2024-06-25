import {
  Resource as ResourceModel,
  Blob,
  File,
  ResourceType,
  User,
} from '@prisma/client'
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
  date: Date | null
  number: number | null
  option: Option | null
  options?: Option[]
  string: string | null
  user: User | null
  file: (File & { Blob: Blob }) | null
  resource: ResourceModel | null
}

export type Data = Record<string, string[] | string | number | boolean | null>
