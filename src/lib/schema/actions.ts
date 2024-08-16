'use server'

import { readAndExtendSession } from '../../domain/iam/session'
import * as domain from '@/domain/schema/actions'

export const readSchema = async (
  params: Omit<domain.ReadSchemaParams, 'accountId'>,
) => {
  const {
    account: { id: accountId },
  } = await readAndExtendSession()

  return domain.readSchema({ ...params, accountId })
}
