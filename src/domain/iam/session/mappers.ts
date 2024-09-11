import { mapAccountModelToEntity } from '../account/mappers'
import { mapUserModelToEntity } from '../user/mappers'
import { Session } from './entity'
import { SessionModel } from './model'

export const mapSessionModelToEntity = (model: SessionModel): Session => ({
  id: model.id,
  accountId: model.Account.id,
  userId: model.User.id,
  account: mapAccountModelToEntity(model.Account),
  user: mapUserModelToEntity(model.User),
  expiresAt: model.expiresAt,
})
