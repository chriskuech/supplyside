import { Prisma, Session as SessionCoreModel } from '@prisma/client'
import { User, UserModel, mapUserModel, userInclude } from '../user/types'
import {
  Account,
  AccountModel,
  accountInclude,
  mapAccountModel,
} from '../account/types'

export type Session = {
  id: string
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
  id: model.id,
  accountId: model.Account.id,
  userId: model.User.id,
  account: mapAccountModel(model.Account),
  user: mapUserModel(model.User),
  expiresAt: model.expiresAt,
})

export const sessionIncludes = {
  Account: {
    include: accountInclude,
  },
  User: {
    include: userInclude,
  },
} satisfies Prisma.SessionInclude
