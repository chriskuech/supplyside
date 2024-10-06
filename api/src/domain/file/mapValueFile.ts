import { File } from '@supplyside/model'
import { FileModel } from './model'

export const mapFile = (file: FileModel): File => ({
  id: file.id,
  accountId: file.accountId,
  blobId: file.blobId,
  name: file.name,
  contentType: file.Blob.mimeType
})
