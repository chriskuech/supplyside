import 'server-only'
import { revalidateTag } from 'next/cache'
import { client } from '.'

export const createPo = async (accountId: string, resourceId: string) => {
  revalidateTag('Resource')

  await client().PUT('/api/accounts/{accountId}/purchases/{resourceId}/po/', {
    params: {
      path: { accountId, resourceId },
    },
  })
}

export const sendPo = async (accountId: string, resourceId: string) => {
  revalidateTag('Resource')

  await client().POST(
    '/api/accounts/{accountId}/purchases/{resourceId}/po/send/',
    {
      params: {
        path: { accountId, resourceId },
      },
    },
  )
}

export const previewPo = async (
  accountId: string,
  resourceId: string,
): Promise<Buffer | undefined> => {
  const { data: buffer } = await client().GET(
    '/api/accounts/{accountId}/purchases/{resourceId}/po/preview/',
    {
      params: {
        path: { accountId, resourceId },
      },
      next: { tags: ['Purchase'] },
    },
  )

  return buffer as Buffer | undefined
}
