import { isTruthy } from 'remeda'
import { UserModel } from './model'
import { systemAccountId } from '@supplyside/api/const'
import { User } from '@supplyside/model'

export const mapUserModelToEntity = (model: UserModel): User => ({
  id: model.id,
  accountId: model.accountId,
  firstName: model.firstName,
  lastName: model.lastName,
  name: [model.firstName, model.lastName].filter(isTruthy).join(' ') || null,
  email: model.email,
  tsAndCsSignedAt: model.tsAndCsSignedAt?.toISOString() ?? null,
  isAdmin: model.isAdmin,
  isApprover: model.isApprover,
  isGlobalAdmin: model.accountId === systemAccountId,
  profilePicBlobId: model.imageBlobId
})
