import { AccountModel } from './model'
import { Account } from './entity'
import { getDownloadPath } from '@/domain/blobs/util'

export const mapAccountModelToEntity = (model: AccountModel): Account => ({
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
  plaidConnectedAt: model.plaidConnectedAt,
})
