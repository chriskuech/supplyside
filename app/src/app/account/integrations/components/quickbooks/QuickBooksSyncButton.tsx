'use client'

import { syncDataFromQuickBooks } from '../../actions'
import { useAsyncCallback } from '@/lib/hooks/useAsyncCallback'
import LoadingButton from '@/lib/ux/LoadingButton'

export default function QuickBooksSyncButton() {
  const [{ isLoading }, syncData] = useAsyncCallback(() =>
    syncDataFromQuickBooks(),
  )

  return (
    <LoadingButton variant="outlined" onClick={syncData} isLoading={isLoading}>
      Sync data from QuickBooks
    </LoadingButton>
  )
}
