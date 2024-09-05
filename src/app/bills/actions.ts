'use server'

import { syncBill } from '@/domain/quickBooks/entities/bill'

//TODO: delete file and integrate function with approve flow
export async function upsertBill(accountId: string, resourceId: string) {
  return syncBill(accountId, resourceId)
}
