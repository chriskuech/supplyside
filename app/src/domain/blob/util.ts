export const getDownloadPath = (params: {
  blobId: string
  mimeType: string
  fileName: string
  isPreview?: boolean
}): string =>
  `/api/download/${encodeURIComponent(params.fileName)}?blobId=${params.blobId}${params.isPreview ? '&preview' : ''}`

export const createDataUrl = (params: {
  mimeType: string
  buffer: Buffer
}): string =>
  `data:${params.mimeType};base64,${params.buffer.toString('base64')}`
