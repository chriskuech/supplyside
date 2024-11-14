import { z } from 'zod'
import { AddressSchema } from './value/address'
import { ContactSchema } from './value/contact'
import { FileSchema } from './value/file'
import { OptionSchema } from './value/option'
import { UserSchema } from './value/user'
import { ValueResourceSchema } from './value/value-resource'

const ValueSchema = z.union([
  z.object({ address: AddressSchema.nullable() }),
  z.object({ boolean: z.boolean().nullable() }),
  z.object({ contact: ContactSchema.nullable() }),
  z.object({ date: z.string().datetime().nullable() }),
  z.object({ number: z.number().nullable() }),
  z.object({ option: OptionSchema.nullable() }),
  z.object({ options: z.array(OptionSchema) }),
  z.object({ string: z.string().nullable() }),
  z.object({ user: UserSchema.nullable() }),
  z.object({ file: FileSchema.nullable() }),
  z.object({ files: z.array(FileSchema) }),
  z.object({ resource: ValueResourceSchema.nullable() }),
])

export const PatchSchema = z.intersection(
  z.object({
    fieldId: z.string().uuid(),
    timestamp: z.date(),
  }),
  ValueSchema,
)

export type Patch = z.infer<typeof PatchSchema>
