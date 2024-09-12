import { readSession } from '../session/actions'
import * as schemaDomain from '@/domain/schema'

export const readSchema = async (
  params: Omit<schemaDomain.ReadSchemaParams, 'accountId'>,
) => {
  const { accountId } = await readSession()

  return schemaDomain.readSchema({ ...params, accountId })
}
