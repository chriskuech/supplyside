import { AccountModel } from './model'
import { Account } from './entity'

export const mapAccountModelToEntity = (model: AccountModel): Account => ({
  id: model.id,
  key: model.key,
  name: model.name,
  address: model.address,
  logoBlobId: model.LogoBlob?.id ?? null,
})
