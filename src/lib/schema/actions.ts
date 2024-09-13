'use server'

import { withSession } from '../session/actions'
import * as schemaDomain from '@/domain/schema'

export const readSchema = async (
  params: Omit<schemaDomain.ReadSchemaParams, 'accountId'>,
) =>
  await withSession(
    async ({ accountId }) =>
      await schemaDomain.readSchema({ ...params, accountId }),
  )
