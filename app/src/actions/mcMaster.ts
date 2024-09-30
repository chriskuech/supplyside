import { withAccountId } from '@/authz'
import * as client from '@/client/mcmaster'

export const connect = withAccountId(client.connect)
export const disconnect = withAccountId(client.disconnect)

export const createPunchOutServiceRequest = withAccountId(
  client.createPunchOutServiceRequest,
)
