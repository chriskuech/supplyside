import { Button } from '@mui/material'
import QuickbooksOauthClient from 'intuit-oauth'
import Csrf from 'csrf'
import config from '@/services/config'
import { quickBooksClient } from '@/domain/quickBooks/client'

export default async function QuickBooksConnectButton() {
  const state = {
    csrf: new Csrf().create(config().QUICKBOOKS_CSRF_SECRET),
  }

  const authUri = quickBooksClient().authorizeUri({
    scope: [QuickbooksOauthClient.scopes.Accounting],
    state: JSON.stringify(state),
  })

  return (
    <Button variant="outlined" href={authUri}>
      Connect to QuickBooks
    </Button>
  )
}
