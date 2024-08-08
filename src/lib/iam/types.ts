import { User as UserModel } from '@prisma/client'

export type User = Pick<
  UserModel,
  | 'id'
  | 'accountId'
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'isApprover'
  | 'isAdmin'
> & {
  isGlobalAdmin: boolean
}
