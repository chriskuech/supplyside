import { match } from 'ts-pattern'
import BillsInboxControl from './BillsInboxControl'
import ListPage from '@/lib/resource/ListPage'
import { requireSessionWithRedirect } from '@/lib/session/actions'
import config from '@/services/config'

export default async function Bills() {
  const { account } = await requireSessionWithRedirect()

  const domain = match(config().NODE_ENV)
    .with('development', () => 'bills-dev.supplyside.io')
    .with('integration', () => 'bills-int.supplyside.io')
    .with('production', () => 'bills.supplyside.io')
    .exhaustive()

  const address = `${account.key}@${domain}`

  return (
    <ListPage
      tableKey="billsList"
      resourceType="Bill"
      callToActions={[
        <BillsInboxControl key={BillsInboxControl.name} address={address} />,
      ]}
    />
  )
}
