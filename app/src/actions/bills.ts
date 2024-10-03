'use server'

import { fields, selectSchemaFieldUnsafe } from '@supplyside/model'
import { withAccountId } from '@/authz'
import * as client from '@/client/bills'
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
        fieldId: selectSchemaFieldUnsafe(schema, fields.purchase).fieldId,
        valueInput: { resourceId: purchaseId },
      },
    ])

    await client.linkPurchase(accountId, resourceId, { purchaseId })
  },
)
