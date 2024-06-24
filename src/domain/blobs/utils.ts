export type Params = {
  blobId: string
  mimeType: string
  fileName: string
}

export const getDownloadPath = (params: Params): string =>
  `/api/download/${params.fileName}.${params.mimeType.toLowerCase().split('/').pop()}?blobId=${params.blobId}`
