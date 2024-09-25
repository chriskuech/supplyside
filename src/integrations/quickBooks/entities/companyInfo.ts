import { container } from 'tsyringe'
import { QuickBooksService, baseUrl } from '..'
import { companyInfoSchema } from '../schemas'
import { CompanyInfo } from '../types'
import { quickBooksClient } from '../util'

export const getCompanyInfo = async (
  accountId: string,
): Promise<CompanyInfo> => {
  const quickBooksService = container.resolve(QuickBooksService)

  const token = await quickBooksService.requireTokenWithRedirect(accountId)
  const client = quickBooksClient(token)

  return client
    .makeApiCall({
      url: `${baseUrl(client.token.realmId)}/companyinfo/${client.token.realmId}`,
      method: 'GET',
    })
    .then((data) => companyInfoSchema.parse(data.json))
}
