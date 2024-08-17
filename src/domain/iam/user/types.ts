import { Blob, Prisma, User as UserCoreModel } from '@prisma/client'
import { getDownloadPath } from '../../blobs/utils'
import { systemAccountId } from '@/lib/const'

export const userInclude = {
  ImageBlob: true,
} satisfies Prisma.UserInclude

export type User = {
  id: string
  accountId: string
  firstName: string | null
  lastName: string | null
  fullName: string
  email: string
  profilePicPath: string | null
  requirePasswordReset: boolean
  tsAndCsSignedAt: Date | null
  isApprover: boolean
  isAdmin: boolean
  isGlobalAdmin: boolean
}

export type UserModel = UserCoreModel & {
  ImageBlob: Blob | null
}

export const mapUserModel = (model: UserModel): User => ({
  id: model.id,
  accountId: model.accountId,
  firstName: model.firstName,
  lastName: model.lastName,
  fullName: `${model.firstName} ${model.lastName}`,
  email: model.email,
  profilePicPath:
    model.ImageBlob &&
    getDownloadPath({
      blobId: model.ImageBlob.id,
      mimeType: model.ImageBlob.mimeType,
      fileName: 'profile-pic',
    }),
  requirePasswordReset: model.requirePasswordReset,
  tsAndCsSignedAt: model.tsAndCsSignedAt,
  isAdmin: model.isAdmin,
  isApprover: model.isApprover,
  isGlobalAdmin: model.accountId === systemAccountId,
})
