import { getDownloadPath } from '../blob/util'
import { File } from '@supplyside/api/domain/file/types'
import { FileModel } from '@supplyside/api/domain/file/model'

export const mapFile = (file: FileModel): File => ({
  id: file.id,
  accountId: file.accountId,
  blobId: file.blobId,
  name: file.name,
  contentType: file.Blob.mimeType,
  downloadPath: getDownloadPath({
    blobId: file.blobId,
    mimeType: file.Blob.mimeType,
    fileName: file.name,
    isPreview: false,
  }),
  previewPath: getDownloadPath({
    blobId: file.blobId,
    mimeType: file.Blob.mimeType,
    fileName: file.name,
    isPreview: true,
  }),
})
