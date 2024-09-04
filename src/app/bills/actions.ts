'use server'

import { upsertBill as domainUpsertBill } from '@/domain/quickBooks/entities/bill'

//TODO: delete file and integrate function with approve flow
export async function upsertBill(accountId: string, resourceId: string) {
  return domainUpsertBill(accountId, resourceId)
}
