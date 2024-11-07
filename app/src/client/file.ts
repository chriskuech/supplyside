import { revalidateTag } from 'next/cache'
import { client } from '.'

export const readFile = async (accountId: string, fileId: string) => {
  const { data: file } = await client().GET(
    '/api/accounts/{accountId}/files/{fileId}/',
    {
      params: {
        path: { accountId, fileId },
      },
    },
  )

  return file
}

export const createFile = async (
  accountId: string,
  data: {
    name: string
    blobId: string
  },
) => {
  revalidateTag('Resources')

  const { data: file } = await client().POST(
    '/api/accounts/{accountId}/files/',
    {
      params: {
        path: { accountId },
      },
      body: data,
    },
  )

  return file
}

export const createFileToken = async (
  accountId: string,
  fileId: string,
): Promise<{ token: string } | undefined> => {
  const { data: token } = await client().POST(
    '/api/accounts/{accountId}/files/{fileId}/token/',
    {
      params: { path: { accountId, fileId } },
    },
  )

  return token
}
