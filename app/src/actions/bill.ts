'use server'

import { fields } from '@supplyside/model'
import { withAccountId } from '@/authz'
import * as client from '@/client/bill'
import { updateResource } from '@/client/resource'
import { readSchema } from '@/client/schema'

export const linkPurchase = withAccountId(
  async (
    accountId,
    resourceId: string,
    { purchaseId }: { purchaseId: string },
  ) => {
    const schema = await readSchema(accountId, 'Bill')
    if (!schema) return

    await updateResource(accountId, resourceId, [
      {
        field: fields.purchase,
        valueInput: { resourceId: purchaseId },
      },
    ])

    await client.linkPurchase(accountId, resourceId, { purchaseId })
  },
)

export const syncFromAttachments = withAccountId(client.syncFromAttachments)
