export type Blob = {
  id: string
  accountId: string
  mimeType: string
}

export type BlobWithData = Blob & {
  buffer: Buffer
}
