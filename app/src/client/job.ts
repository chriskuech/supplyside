import { revalidateTag } from 'next/cache'
import { client } from '.'

export const syncFromAttachments = async (
  accountId: string,
  resourceId: string,
) => {
  revalidateTag('Resources')

  await client().POST(
    '/api/accounts/{accountId}/jobs/{resourceId}/sync-from-attachments/',
    {
      params: {
        path: { accountId, resourceId },
      },
    },
  )
}
