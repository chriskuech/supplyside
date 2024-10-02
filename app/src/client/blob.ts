import 'server-only'
import { client } from '.'

export const createBlob = async (accountId: string, file: File) => {
  const buffer = Buffer.from(await file.arrayBuffer())

  const { data: blob } = await client().POST(
    '/api/accounts/{accountId}/blobs',
    {
      params: {
        path: { accountId },
        header: {
          'content-type': file.type,
        },
      },
      // circumvent bug in openapi-fetch
      body: buffer satisfies Buffer as unknown as undefined,
    },
  )

  return blob
}

export const readBlob = async (accountId: string, blobId: string) => {
  const { data: blob } = await client().GET(
    '/api/accounts/{accountId}/blobs/{blobId}',
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
    '/api/accounts/{accountId}/blobs/{blobId}/download',
    {
      params: {
        path: { accountId, blobId },
      },
      parseAs: 'arrayBuffer',
    },
  )

  return buffer
}
