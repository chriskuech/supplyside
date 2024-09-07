import { File } from '@/domain/files/types'
import { getDownloadPath } from '@/domain/blobs'
import { FileModel } from '@/domain/files/model'

export const mapFile = (file: FileModel): File => ({
  id: file.id,
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
