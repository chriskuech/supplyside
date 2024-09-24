import { fail } from 'assert'
import OAuthClient, { Token } from 'intuit-oauth'
import Csrf from 'csrf'
import QuickbooksOauthClient from 'intuit-oauth'
import { container } from 'tsyringe'
import ConfigService from '@/integrations/ConfigService'

export const createQuickBooksSetupUrl = () => {
  const { csrfSecret } = getQuickBooksConfigUnsafe()

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
  new OAuthClient({ ...getQuickBooksConfigUnsafe(), token })

export const getQuickBooksConfig = () => {
  const {
    config: {
      QUICKBOOKS_CLIENT_ID: clientId,
      QUICKBOOKS_CLIENT_SECRET: clientSecret,
      QUICKBOOKS_CSRF_SECRET: csrfSecret,
      QUICKBOOKS_ENVIRONMENT: environment,
      BASE_URL,
    },
  } = container.resolve(ConfigService)

  if (!clientId || !clientSecret || !csrfSecret || !environment) {
    return null
  }

  return {
    clientId,
    clientSecret,
    csrfSecret,
    environment,
    redirectUri: BASE_URL + '/api/integrations/quickbooks/login',
    apiBaseUrl: {
      sandbox: 'https://sandbox-quickbooks.api.intuit.com',
      production: 'https://quickbooks.api.intuit.com',
    }[environment],
    appBaseUrl: {
      sandbox: 'https://sandbox.qbo.intuit.com',
      production: 'https://qbo.intuit.com',
    }[environment],
  }
}

export const getQuickBooksConfigUnsafe = () =>
  getQuickBooksConfig() ?? fail('QuickBooks not configured')
