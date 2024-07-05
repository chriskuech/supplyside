'use server'

import { requireSession } from '../session'
import * as domain from '@/domain/schema/actions'

export const readSchema = async (
  params: Omit<domain.ReadSchemaParams, 'accountId'>,
) => {
  const { accountId } = await requireSession()

  return domain.readSchema({ ...params, accountId })
}
