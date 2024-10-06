import { Blob, File, Prisma } from '@prisma/client'

export type FileModel = File & { Blob: Blob }

export const fileInclude = {
  Blob: true,
} satisfies Prisma.FileInclude
