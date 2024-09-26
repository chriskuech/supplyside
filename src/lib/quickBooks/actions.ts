'use server'
import { redirect } from 'next/navigation'
import { container } from '../di'
import { QuickBooksService } from '@/integrations/quickBooks/QuickBooksService'

export const requireTokenWithRedirect = async (
  accountId: string,
): Promise<void> => {
  const isConnected = await container()
    .resolve(QuickBooksService)
    .isConnected(accountId)

  if (!isConnected) redirect('account/integrations')
}
