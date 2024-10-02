import { z } from 'zod'
import { redirect } from 'next/navigation'
import { config } from '@/config'
import { disconnect } from '@/client/mcmaster'

export default async function QuickbooksLogout({
  searchParams,
}: {
  searchParams: Record<string, string | unknown>
}) {
  const realmId = z.string().safeParse(searchParams['realmId']).data

  if (!realmId)
    return redirect(`${config().BASE_URL}/integrations/quickbooks/disconnected`)

  await disconnect(realmId)

  return redirect(`${config().BASE_URL}/integrations/quickbooks/disconnected`)
}
