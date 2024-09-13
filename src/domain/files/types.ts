export type File = {
  id: string
  accountId: string
  blobId: string
  name: string
  contentType: string
  downloadPath: string
  previewPath: string
}

export type JsFile = globalThis.File
