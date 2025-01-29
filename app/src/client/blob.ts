import 'server-only'
import { client } from '.'

export const createBlob = async (accountId: string, file: File) => {
  const arrayBuffer = await file.arrayBuffer()

  const { data: blob } = await client().POST(
    '/api/accounts/{accountId}/blobs/',
    {
      headers: {
        'Content-Type': /\.(step|stp)$/i.test(file.name)
          ? 'model/step'
          : file.type,
      },
      params: {
        path: { accountId },
      },

      // hacks for compatibility with blobs
      body: arrayBuffer as unknown as undefined,
      bodySerializer: (e) => e,
    },
  )

  return blob
}

export const readBlob = async (accountId: string, blobId: string) => {
  const { data: blob } = await client().GET(
    '/api/accounts/{accountId}/blobs/{blobId}/',
    {
      params: {
        path: { accountId, blobId },
      },
    },
  )

  return blob
}

export const readBlobData = async (accountId: string, blobId: string) => {
  const { data: buffer } = await client().GET(
    '/api/accounts/{accountId}/blobs/{blobId}/download/',
    {
      params: {
        path: { accountId, blobId },
      },
      parseAs: 'arrayBuffer',
    },
  )

  return buffer
}
