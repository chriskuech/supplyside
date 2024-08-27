import OAuthClient, { Token } from 'intuit-oauth'
import {
  deleteQuickbooksToken,
  getQuickbooksToken,
  updateQuickbooksToken,
} from './actions'
import config from '@/services/config'

export type QuickbooksToken = {
  latency: number
  realmId: string
  token_type: string
  access_token: string
  refresh_token: string
  expires_in: number
  x_refresh_token_expires_in: number
  id_token: string
  createdAt: number
}

const { BASE_URL, QUICKBOOKS_ENVIRONMENT } = config()
const environmentUrls = {
  sandbox: 'https://sandbox-quickbooks.api.intuit.com/',
  production: 'https://quickbooks.api.intuit.com/',
}
const redirectUri = `${BASE_URL}/api/integrations/quickbooks`
const environment = QUICKBOOKS_ENVIRONMENT
export const quickbooksBaseUrl = environmentUrls[environment]

export const cleanToken = (token: Token): QuickbooksToken => ({
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

export const isRefreshTokenValid = (token: QuickbooksToken) => {
  const createdAtDate = new Date(token.createdAt)
  const expirationTime =
    createdAtDate.getTime() + token.x_refresh_token_expires_in * 1000
  const currentTime = Date.now()

  return expirationTime > currentTime
}

export const quickbooksClient = () =>
  new OAuthClient({
    clientId: config().QUICKBOOKS_CLIENT_ID,
    clientSecret: config().QUICKBOOKS_CLIENT_SECRET,
    environment,
    redirectUri,
  })

export const authQuickbooksClient = async (accountId: string) => {
  const token = await getQuickbooksToken(accountId)

  if (!token) {
    throw new Error('Account has no quickbooks token')
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
      await updateQuickbooksToken(accountId, cleanToken(tokenResponse.token))
      return client
    } else {
      await deleteQuickbooksToken(accountId)
      throw new Error('Quickbooks token has expired')
    }
  }

  return client
}
