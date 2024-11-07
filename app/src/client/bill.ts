import { revalidateTag } from 'next/cache'
import { client } from '.'

export const linkPurchase = async (
  accountId: string,
  resourceId: string,
  { purchaseId }: { purchaseId: string },
) => {
  revalidateTag('Resources')

  await client().POST(
    '/api/accounts/{accountId}/bills/{resourceId}/link-purchase/',
    {
      params: {
        path: { accountId, resourceId },
      },
      body: { purchaseId },
    },
  )
}

export const syncFromAttachments = async (
  accountId: string,
  resourceId: string,
) => {
  revalidateTag('Resources')

  await client().POST(
    '/api/accounts/{accountId}/bills/{resourceId}/sync-from-attachments/',
    {
      params: {
        path: { accountId, resourceId },
      },
    },
  )
}
