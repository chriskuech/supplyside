import { Blob, User, Prisma } from '@prisma/client'

export type UserModel = User & {
  ImageBlob: Blob | null
}

export const userInclude = {
  ImageBlob: true,
} satisfies Prisma.UserInclude
