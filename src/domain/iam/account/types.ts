import { Account as AccountCoreModel, Blob, Prisma } from '@prisma/client'
import { getDownloadPath } from '@/domain/blobs/utils'

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

export const mapAccountModel = (model: AccountModel): Account => ({
  id: model.id,
  key: model.key,
  name: model.name,
  address: model.address,
  logoPath:
    model.LogoBlob &&
    getDownloadPath({
      blobId: model.LogoBlob.id,
      mimeType: model.LogoBlob.mimeType,
      fileName: 'logo',
    }),
  logoBlobId: model.LogoBlob?.id ?? null,
})
