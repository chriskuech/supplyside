import { z } from 'zod'

export const FileSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  blobId: z.string(),
  name: z.string(),
  contentType: z.string(),
})

export type File = z.infer<typeof FileSchema>
