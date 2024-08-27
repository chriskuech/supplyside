import OAuthClient, { Token } from 'intuit-oauth'
import { QuickBooksConnection } from '@prisma/client'
import {
  deleteQuickBooksToken,
  getQuickbooksToken,
  updateQuickBooksToken,
} from './actions'
import config from '@/services/config'

export type QuickBooksToken = Omit<QuickBooksConnection, 'id'>

const { BASE_URL, QUICKBOOKS_ENVIRONMENT } = config()
const environmentUrls = {
  sandbox: 'https://sandbox-quickbooks.api.intuit.com/',
  production: 'https://quickbooks.api.intuit.com/',
}
const redirectUri = `${BASE_URL}/api/integrations/quickbooks`
const environment = QUICKBOOKS_ENVIRONMENT
export const quickBooksBaseUrl = environmentUrls[environment]

export const cleanToken = (token: Token): QuickBooksToken => ({
  access_token: token.access_token,
  createdAt: token.createdAt,
  expires_in: token.expires_in,
  id_token: token.id_token,
  latency: token.latency,
  realmId: token.realmId,
  refresh_token: token.refresh_token,
  token_type: token.token_type,
  x_refresh_token_expires_in: token.x_refresh_token_expires_in,
})

export const isRefreshTokenValid = (token: QuickBooksToken) => {
  const createdAtDate = new Date(token.createdAt)
  const expirationTime =
    createdAtDate.getTime() + token.x_refresh_token_expires_in * 1000
  const currentTime = Date.now()

  return expirationTime > currentTime
}

export const quickBooksClient = () =>
  new OAuthClient({
    clientId: config().QUICKBOOKS_CLIENT_ID,
    clientSecret: config().QUICKBOOKS_CLIENT_SECRET,
    environment,
    redirectUri,
  })

export const authQuickBooksClient = async (accountId: string) => {
  const token = await getQuickbooksToken(accountId)

  if (!token) {
    throw new Error('Account has no quickBooks token')
  }

  const client = new OAuthClient({
    clientId: config().QUICKBOOKS_CLIENT_ID,
    clientSecret: config().QUICKBOOKS_CLIENT_SECRET,
    environment,
    redirectUri,
    token,
  })

  if (!client.isAccessTokenValid()) {
    if (isRefreshTokenValid(token)) {
      const tokenResponse = await client.refresh()
      await updateQuickBooksToken(accountId, cleanToken(tokenResponse.token))
      return client
    } else {
      await deleteQuickBooksToken(accountId)
      throw new Error('Quickbooks token has expired')
    }
  }

  return client
}
