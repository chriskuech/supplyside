import { fail } from 'assert'
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'
import config from '@/services/config'
import 'server-only'

export const getPlaidConfig = () => {
  const {
    PLAID_ENV: environment,
    PLAID_CLIENT_ID: clientId,
    PLAID_SECRET: clientSecret,
  } = config()

  if (!clientId || !clientSecret || !environment) {
    return null
  }

  return {
    clientId,
    clientSecret,
    environment,
  }
}

export const getPlaidConfigUnsafe = () =>
  getPlaidConfig() ?? fail('Plaid not configured')

export const plaidClient = () =>
  new PlaidApi(
    new Configuration({
      basePath: PlaidEnvironments[getPlaidConfigUnsafe().environment],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': getPlaidConfigUnsafe().clientId,
          'PLAID-SECRET': getPlaidConfigUnsafe().clientSecret,
          'Plaid-Version': '2020-09-14',
        },
      },
    }),
  )
