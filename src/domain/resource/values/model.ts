import {
  Blob,
  Contact,
  Field,
  Option,
  User,
  Value,
  ValueOption,
  Resource,
  ResourceField,
} from '@prisma/client'
import { FileModel } from '@/domain/files/model'

export type ResourceValueModel = Resource & {
  ResourceField: (ResourceField & {
    Field: Field
    Value: Value
  })[]
}

export type ValueModel = Value & {
  Contact: Contact | null
  File: FileModel | null
  Option: Option | null
  User: (User & { ImageBlob: Blob | null }) | null
  Files: { File: FileModel }[]
  ValueOption: (ValueOption & { Option: Option })[]
  Resource: ResourceValueModel | null
}
