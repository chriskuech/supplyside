'use server'
import { ResourceType } from '@prisma/client'
import { withSession } from '../session/actions'
import { container } from '../di'
import { SchemaService } from '@/domain/schema/SchemaService'

export const readSchema = async (
  resourceType: ResourceType,
  isSystem?: boolean,
) =>
  await withSession(
    async ({ accountId }) =>
      await container()
        .resolve(SchemaService)
        .readSchema(accountId, resourceType, isSystem),
  )
