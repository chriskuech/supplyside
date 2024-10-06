import { z } from 'zod'

export const OptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  templateId: z.string().nullable(),
})

export type Option = z.infer<typeof OptionSchema>
