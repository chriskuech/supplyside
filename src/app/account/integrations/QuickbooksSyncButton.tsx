'use client'

import { syncDataFromQuickBooks } from '@/domain/quickBooks/actions'
import { useAsyncCallback } from '@/lib/hooks/useAsyncCallback'
import LoadingButton from '@/lib/ux/LoadingButton'

export default function QuickBooksSyncButton() {
  const [{ data, isLoading }, syncData] = useAsyncCallback(() =>
    syncDataFromQuickBooks(),
  )

  console.log({ data })
  return (
    <LoadingButton variant="outlined" onClick={syncData} isLoading={isLoading}>
      Sync data from QuickBooks
    </LoadingButton>
  )
}
