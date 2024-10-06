import { Blob, Prisma, User } from '@prisma/client'

export type UserModel = User & { ImageBlob: Blob | null }

export const userInclude = {
  ImageBlob: true
} satisfies Prisma.UserInclude
