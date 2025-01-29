import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import { config } from '@/config'
import { disconnect } from '@/actions/quickBooks'

export async function GET({ url }: NextRequest) {
  const mappedUrl = new URL(url)
  const realmId = mappedUrl.searchParams.get('realmId')

  if (!realmId)
    return redirect(
      `${config().APP_BASE_URL}/integrations/quickbooks/disconnected`,
    )

  await disconnect(realmId)

  return redirect(
    `${config().APP_BASE_URL}/integrations/quickbooks/disconnected`,
  )
}
