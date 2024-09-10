import { AccountModel } from './model'
import { getDownloadPath } from '@/domain/blobs'

export type Account = {
  id: string
  key: string
  name: string
  address: string
  logoPath: string | null
  logoBlobId: string | null
  quickBooksConnectedAt: Date | null
}

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
  quickBooksConnectedAt: model.quickBooksConnectedAt,
})
