import { Account } from './entity'
import { AccountModel } from './model'

export const mapAccountModelToEntity = (model: AccountModel): Account => ({
  id: model.id,
  key: model.key,
  name: model.name,
  address: model.address,
  logoBlobId: model.LogoBlob?.id ?? null,
})
