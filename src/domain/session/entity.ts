import { Account } from '../account/entity'
import { User } from '../user/entity'

export type Session = {
  id: string
  accountId: string
  userId: string
  account: Account
  user: User
  expiresAt: Date
}
