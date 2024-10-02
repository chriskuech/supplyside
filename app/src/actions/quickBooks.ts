'use server'

import { withAccountId } from '@/authz'
import * as client from '@/client/quickBooks'

export const pullData = withAccountId(client.pullData)
export const pushBill = withAccountId(client.pushBill)
export const connect = withAccountId(client.connect)
export const disconnect = client.disconnect
