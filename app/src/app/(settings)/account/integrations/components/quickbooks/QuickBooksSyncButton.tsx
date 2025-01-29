'use client'

import { pullData } from '@/actions/quickBooks'
import { useAsyncCallback } from '@/hooks/useAsyncCallback'
import LoadingButton from '@/lib/ux/LoadingButton'

export default function QuickBooksSyncButton() {
  const [{ isLoading }, syncData] = useAsyncCallback(() => pullData())

  return (
    <LoadingButton variant="outlined" onClick={syncData} isLoading={isLoading}>
      Sync data from QuickBooks
    </LoadingButton>
  )
}
