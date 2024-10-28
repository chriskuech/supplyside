import 'server-only'
import { revalidateTag } from 'next/cache'
import { client } from '.'

export const read = async (accountId: string) => {
  const { data } = await client().GET(
    '/api/accounts/{accountId}/integrations/quickbooks/',
    {
      params: {
        path: { accountId },
      },
      next: { tags: ['QuickBooks'] },
    },
  )

  return data
}

export const connect = async (accountId: string, url: string) => {
  revalidateTag('QuickBooks')

  const { data } = await client().POST(
    '/api/accounts/{accountId}/integrations/quickbooks/connect/',
    {
      params: {
        path: { accountId },
        query: { url },
      },
    },
  )

  return data
}

export const disconnect = async (realmId: string) => {
  revalidateTag('QuickBooks')

  const { data } = await client().POST('/integrations/quickbooks/disconnect/', {
    params: {
      query: { realmId },
    },
  })

  return data
}

export const pushBill = async (accountId: string, billResourceId: string) => {
  const { data } = await client().PUT(
    '/api/accounts/{accountId}/integrations/quickbooks/bills/{billResourceId}/',
    {
      params: {
        path: { accountId, billResourceId },
      },
    },
  )

  return data
}

export const pushInvoice = async (accountId: string, jobResourceId: string) => {
  const { data } = await client().PUT(
    '/api/accounts/{accountId}/integrations/quickbooks/invoices/{jobResourceId}/',
    {
      params: {
        path: { accountId, jobResourceId },
      },
    },
  )

  return data
}

export const pullData = async (accountId: string) => {
  await client().POST(
    '/api/accounts/{accountId}/integrations/quickbooks/pull-data/',
    {
      params: {
        path: { accountId },
      },
    },
  )
}
