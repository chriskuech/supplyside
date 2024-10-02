'use server'

import { withAccountId } from '@/authz'
import * as client from '@/client/mcmaster'

export const readConnection = withAccountId(client.readConnection)
export const connect = withAccountId(client.connect)
export const disconnect = withAccountId(client.disconnect)

export const createPunchOutServiceRequest = withAccountId(
  client.createPunchOutServiceRequest,
)
