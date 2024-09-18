'use server'

import { revalidatePath } from 'next/cache'
import * as domain from '@/domain/resource/costs'
import { withSession } from '@/lib/session/actions'

export const createCost = (
  params: Omit<domain.CreateCostParams, 'accountId'>,
) =>
  withSession(({ accountId }) =>
    domain.createCost({ ...params, accountId }).then(() => revalidatePath('')),
  )

export const updateCost = (
  params: Omit<domain.UpdateCostParams, 'accountId'>,
) =>
  withSession(({ accountId }) =>
    domain.updateCost({ ...params, accountId }).then(() => revalidatePath('')),
  )

export const deleteCost = (
  params: Omit<domain.DeleteCostParams, 'accountId'>,
) =>
  withSession(({ accountId }) =>
    domain.deleteCost({ ...params, accountId }).then(() => revalidatePath('')),
  )
