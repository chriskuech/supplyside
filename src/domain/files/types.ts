export type File = {
  id: string
  blobId: string
  name: string
  contentType: string
  downloadPath: string
  previewPath: string
}

export type JsFile = globalThis.File
