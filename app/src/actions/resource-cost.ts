'use server'

import * as client from '@/client/resource-cost'
import { withAccountId } from '@/authz'

export const createCost = withAccountId(client.createCost)
export const updateCost = withAccountId(client.updateCost)
export const deleteCost = withAccountId(client.deleteCost)
