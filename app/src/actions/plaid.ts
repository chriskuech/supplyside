'use server'

import { withAccountId } from '@/authz'
import * as client from '@/client/plaid'

export const connect = withAccountId(client.connect)
export const disconnect = withAccountId(client.disconnect)

export const createPlaidLinkToken = withAccountId(client.createPlaidLinkToken)
