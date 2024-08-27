import { Button } from '@mui/material'
import QuickbooksOauthClient from 'intuit-oauth'
import Csrf from 'csrf'
import config from '@/services/config'
import { quickbooksClient } from '@/domain/quickbooks/actions'

type Props = {
  accountId: string
}

export default async function QuickbooksConnectButton({ accountId }: Props) {
  const state = {
    accountId,
    csrf: new Csrf().create(config().QUICKBOOKS_CSRF_SECRET),
  }

  const authUri = quickbooksClient().authorizeUri({
    scope: [QuickbooksOauthClient.scopes.Accounting],
    state: JSON.stringify(state),
  })

  return (
    <Button variant="outlined" href={authUri}>
      Connect to QuickBooks
    </Button>
  )
}
