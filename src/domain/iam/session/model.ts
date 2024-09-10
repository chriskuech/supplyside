import { Prisma, Session } from '@prisma/client'
import { AccountModel, accountInclude } from '../account/model'
import { UserModel, userInclude } from '../user/model'

export type SessionModel = Session & {
  Account: AccountModel
  User: UserModel
}

export const sessionIncludes = {
  Account: {
    include: accountInclude,
  },
  User: {
    include: userInclude,
  },
} satisfies Prisma.SessionInclude
