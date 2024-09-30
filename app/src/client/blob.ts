import 'server-only'
import { fail } from 'assert'
import { client } from '.'

export const createBlob = async ({}: { accountId: string; file: File }) =>
  fail('NYI')

export const readBlob = async (accountId: string, blobId: string) => {
  const { data: blob } = await client.GET(
    '/api/accounts/{accountId}/blobs/{blobId}/',
    {
      params: {
        path: { accountId, blobId },
      },
    },
  )

  return blob
}
