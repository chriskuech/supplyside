import { Account, Blob, Prisma } from '@prisma/client'

export type AccountModel = Account & {
  LogoBlob: Blob | null
}

export const accountInclude = {
  LogoBlob: true
} satisfies Prisma.AccountInclude
