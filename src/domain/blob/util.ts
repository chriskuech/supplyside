export const getDownloadPath = (params: {
  blobId: string
  mimeType: string
  fileName: string
  isPreview?: boolean
}): string =>
  `/api/download/${encodeURIComponent(params.fileName)}?blobId=${params.blobId}${params.isPreview ? '&preview' : ''}`
