import {
  Blob,
  Contact,
  Field,
  File,
  Option,
  User,
  Value,
  ValueOption,
  Resource,
  ResourceField,
} from '@prisma/client'

export type ResourceValueModel = Resource & {
  ResourceField: (ResourceField & {
    Field: Field
    Value: Value
  })[]
}

export type ValueModel = Value & {
  Contact: Contact | null
  File: (File & { Blob: Blob }) | null
  Option: Option | null
  User: (User & { ImageBlob: Blob | null }) | null
  Files: { File: File & { Blob: Blob } }[]
  ValueOption: (ValueOption & { Option: Option })[]
  Resource: ResourceValueModel | null
}
