import { Session as SessionCoreModel } from '@prisma/client'
import { User, UserModel, mapUserModel } from '../user/types'
import { Account, AccountModel } from '../account/types'
import { mapAccountModel } from '../account/actions'

export type Session = {
  accountId: string
  userId: string
  account: Account
  user: User
  expiresAt: Date
}

export type SessionModel = SessionCoreModel & {
  Account: AccountModel
  User: UserModel
}

export const mapSessionModel = (model: SessionModel): Session => ({
  accountId: model.Account.id,
  userId: model.User.id,
  account: mapAccountModel(model.Account),
  user: mapUserModel(model.User),
  expiresAt: model.expiresAt,
})
