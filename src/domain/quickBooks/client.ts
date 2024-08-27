import OAuthClient, { Token } from 'intuit-oauth'
import config from '@/services/config'

export const environmentUrls = {
  sandbox: 'https://sandbox-quickbooks.api.intuit.com/',
  production: 'https://quickbooks.api.intuit.com/',
}
const redirectUri = () => `${config().BASE_URL}/api/integrations/quickbooks`

export const quickBooksClient = () =>
  new OAuthClient({
    clientId: config().QUICKBOOKS_CLIENT_ID,
    clientSecret: config().QUICKBOOKS_CLIENT_SECRET,
    environment: config().QUICKBOOKS_ENVIRONMENT,
    redirectUri: redirectUri(),
  })

export const authQuickBooksClient = async (token: Token) => {
  const client = new OAuthClient({
    clientId: config().QUICKBOOKS_CLIENT_ID,
    clientSecret: config().QUICKBOOKS_CLIENT_SECRET,
    environment: config().QUICKBOOKS_ENVIRONMENT,
    redirectUri: redirectUri(),
    token,
  })

  return client
}
