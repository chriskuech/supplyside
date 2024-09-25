'use server'

import { revalidatePath } from 'next/cache'
import { container } from 'tsyringe'
import { withSession } from '@/lib/session/actions'
import { CostService } from '@/domain/resource/costs'

export const createCost = (resourceId: string) =>
  withSession(({ accountId }) =>
    container
      .resolve(CostService)
      .create(accountId, resourceId)
      .then(() => revalidatePath('')),
  )

export const updateCost = (
  resourceId: string,
  costId: string,
  data: {
    name?: string
    isPercentage?: boolean
    value?: number
  },
) =>
  withSession(({ accountId }) =>
    container
      .resolve(CostService)
      .update(accountId, resourceId, costId, data)
      .then(() => revalidatePath('')),
  )

export const deleteCost = (resourceId: string, costId: string) =>
  withSession(({ accountId }) =>
    container
      .resolve(CostService)
      .delete(accountId, resourceId, costId)
      .then(() => revalidatePath('')),
  )
