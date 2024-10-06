import { z } from 'zod'

export const BlobSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  mimeType: z.string().regex(/^\w+\/\w+$/)
})

export type Blob = z.infer<typeof BlobSchema>

export type BlobWithData = Blob & { buffer: Buffer }
