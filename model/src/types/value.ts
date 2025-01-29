import { z } from 'zod'
import { ContactSchema } from '../types/contact'
import { UserSchema } from '../types/user'
import { AddressSchema } from '../types/address'
import { FileSchema } from '../types/file'
import { OptionSchema } from '../types/option'
import { ValueResourceSchema } from '../types/value-resource'

export const ValueSchema = z.object({
  address: AddressSchema.nullable(),
  boolean: z.boolean().nullable(),
  contact: ContactSchema.nullable(),
  date: z.string().datetime().nullable(),
  number: z.number().nullable(),
  option: OptionSchema.nullable(),
  options: z.array(OptionSchema),
  string: z.string().nullable(),
  user: UserSchema.nullable(),
  file: FileSchema.nullable(),
  files: z.array(FileSchema),
  resource: ValueResourceSchema.nullable(),
  updatedAt: z.string().datetime(),
})

export type Value = z.infer<typeof ValueSchema>

// TODO: obsolete
export const emptyValue: Value = {
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
  updatedAt: new Date(0).toISOString(),
}
