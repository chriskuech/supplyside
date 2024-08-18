'use server'

import { readSession } from '../session/actions'
import * as domain from '@/domain/schema/actions'

export const readSchema = async (
  params: Omit<domain.ReadSchemaParams, 'accountId'>,
) => {
  const { accountId } = await readSession()

  return domain.readSchema({ ...params, accountId })
}
