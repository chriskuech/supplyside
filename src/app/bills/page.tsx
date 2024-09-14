import BillsInboxControl from './BillsInboxControl'
import ListPage from '@/lib/resource/ListPage'
import { requireSessionWithRedirect } from '@/lib/session/actions'
import config from '@/services/config'
import '@/server-only'

export default async function Bills() {
  const { account } = await requireSessionWithRedirect('/bills')

  return (
    <ListPage
      tableKey="billsList"
      resourceType="Bill"
      callToActions={[
        <BillsInboxControl
          key={BillsInboxControl.name}
          address={`${account.key}@${config().BILLS_EMAIL_DOMAIN}`}
        />,
      ]}
      path="/bills"
    />
  )
}
