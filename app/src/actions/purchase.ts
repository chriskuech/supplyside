'use server'

import { fields, purchaseStatusOptions } from '@supplyside/model'
import { transitionStatus } from './resource'
import { withAccountId } from '@/authz'
import * as client from '@/client/purchase'

export const approveAndCreatePo = withAccountId(
  async (accountId: string, resourceId: string) => {
    await client.createPo(accountId, resourceId)
    await transitionStatus(
      resourceId,
      fields.purchaseStatus,
      purchaseStatusOptions.approved,
    )
  },
)

export const sendPo = withAccountId(client.sendPo)
export const previewPo = withAccountId(client.previewPo)
export const syncFromAttachments = withAccountId(client.syncFromAttachments)
