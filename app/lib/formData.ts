import { ZodSchema } from 'zod'

export const parseFormData = <T>(schema: ZodSchema<T>, fd: FormData): T =>
  schema.parse(Object.fromEntries(fd.entries()))
