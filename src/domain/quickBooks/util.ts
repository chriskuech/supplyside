import OAuthClient, { Token } from 'intuit-oauth'
import Csrf from 'csrf'
import QuickbooksOauthClient from 'intuit-oauth'
import config from '@/services/config'

export const createQuickBooksSetupUrl = () => {
  const { csrfSecret } = getQuickBooksConfig()

  const state = {
    csrf: new Csrf().create(csrfSecret),
  }

  const authUri = quickBooksClient().authorizeUri({
    scope: [QuickbooksOauthClient.scopes.Accounting],
    state: JSON.stringify(state),
  })

  return authUri
}

export const quickBooksClient = (token?: Token) =>
  new OAuthClient({ ...getQuickBooksConfig(), token })

export const isQuickBooksEnabledForSystem = () => {
  try {
    getQuickBooksConfig()
    return true
  } catch {
    return false
  }
}

export const getQuickBooksConfig = () => {
  const {
    QUICKBOOKS_CLIENT_ID: clientId,
    QUICKBOOKS_CLIENT_SECRET: clientSecret,
    QUICKBOOKS_CSRF_SECRET: csrfSecret,
    QUICKBOOKS_ENVIRONMENT: environment,
    BASE_URL,
  } = config()

  if (!clientId || !clientSecret || !csrfSecret || !environment) {
    throw new Error('QuickBooks environment variables are not set')
  }

  return {
    clientId,
    clientSecret,
    csrfSecret,
    environment,
    redirectUri: BASE_URL + '/api/integrations/quickbooks/login',
    quickBooksApiBaseUrl: {
      sandbox: 'https://sandbox-quickbooks.api.intuit.com/',
      production: 'https://quickbooks.api.intuit.com/',
    }[environment],
  }
}
