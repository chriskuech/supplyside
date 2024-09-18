import { isTruthy } from 'remeda'
import { UserModel } from './model'
import { User } from './entity'
import { getDownloadPath } from '@/domain/blobs/util'
import { systemAccountId } from '@/lib/const'

export const mapUserModelToEntity = (model: UserModel): User => ({
  id: model.id,
  accountId: model.accountId,
  firstName: model.firstName,
  lastName: model.lastName,
  fullName:
    [model.firstName, model.lastName].filter(isTruthy).join(' ') || null,
  email: model.email,
  profilePicPath:
    model.ImageBlob &&
    getDownloadPath({
      blobId: model.ImageBlob.id,
      mimeType: model.ImageBlob.mimeType,
      fileName: 'profile-pic',
    }),
  tsAndCsSignedAt: model.tsAndCsSignedAt,
  isAdmin: model.isAdmin,
  isApprover: model.isApprover,
  isGlobalAdmin: model.accountId === systemAccountId,
})
