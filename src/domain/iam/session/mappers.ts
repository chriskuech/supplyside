import { mapAccountModel } from '../account/entity'
import { mapUserModelToEntity } from '../user/mappers'
import { Session } from './entity'
import { SessionModel } from './model'

export const mapSessionModel = (model: SessionModel): Session => ({
  id: model.id,
  accountId: model.Account.id,
  userId: model.User.id,
  account: mapAccountModel(model.Account),
  user: mapUserModelToEntity(model.User),
  expiresAt: model.expiresAt,
})
