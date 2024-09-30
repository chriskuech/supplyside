import { redirect } from 'next/navigation'
import { connect } from '@/client/quickBooks'
import { requireSession } from '@/session'
import { config } from '@/config'

export default async function QuickbooksLogin() {
  const { accountId } = await requireSession()

  await connect(accountId, '/integrations/quickbooks/login')

  redirect(`${config().BASE_URL}/account/integrations`)
}
