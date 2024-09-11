import { getDownloadPath } from '../blobs'
import { User } from './entity'
import { UserModel } from './model'

export const mapUserModelToEntity = (model: UserModel): User => ({
  id: model.id,
  name: [model.firstName, model.lastName].join(' '),
  email: model.email,
  profilePicPath:
    model.ImageBlob &&
    getDownloadPath({
      blobId: model.ImageBlob.id,
      mimeType: model.ImageBlob.mimeType,
      fileName: 'profile-pic',
    }),
})
