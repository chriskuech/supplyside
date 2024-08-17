import { Account as AccountCoreModel, Blob, Prisma } from '@prisma/client'

export type Account = {
  id: string
  key: string
  name: string
  address: string
  logoPath: string | null
  logoBlobId: string | null
}

export type AccountModel = AccountCoreModel & {
  LogoBlob: Blob | null
}

export const accountInclude = {
  LogoBlob: true,
} satisfies Prisma.AccountInclude
