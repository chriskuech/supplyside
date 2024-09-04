'use client'

import { upsertBill } from '../actions'
import { useAsyncCallback } from '@/lib/hooks/useAsyncCallback'
import LoadingButton from '@/lib/ux/LoadingButton'

type Props = {
  accountId: string
  resourceId: string
}
//TODO: delete component
export default function UpsertBillButton({ accountId, resourceId }: Props) {
  const [{ isLoading }, upsert] = useAsyncCallback(() =>
    upsertBill(accountId, resourceId),
  )

  return (
    <LoadingButton isLoading={isLoading} onClick={upsert}>
      Upsert BILL
    </LoadingButton>
  )
}
