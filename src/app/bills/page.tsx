import { container } from 'tsyringe'
import BillsInboxControl from './BillsInboxControl'
import ConfigService from '@/integrations/ConfigService'
import ListPage from '@/lib/resource/ListPage'
import { requireSessionWithRedirect } from '@/lib/session/actions'

export default async function Bills() {
  const { account } = await requireSessionWithRedirect('/bills')
  const { config } = container.resolve(ConfigService)

  return (
    <ListPage
      tableKey="billsList"
      resourceType="Bill"
      callToActions={[
        <BillsInboxControl
          key={BillsInboxControl.name}
          address={`${account.key}@${config.BILLS_EMAIL_DOMAIN}`}
        />,
      ]}
      path="/bills"
    />
  )
}
