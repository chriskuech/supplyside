import { fail } from 'assert'
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'
import { container } from 'tsyringe'
import ConfigService from '../ConfigService'

export const getPlaidConfig = () => {
  const {
    config: {
      PLAID_ENV: environment,
      PLAID_CLIENT_ID: clientId,
      PLAID_SECRET: clientSecret,
    },
  } = container.resolve(ConfigService)

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
