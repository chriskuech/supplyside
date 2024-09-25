'use server'

import { container } from 'tsyringe'
import { ResourceType } from '@prisma/client'
import { withSession } from '../session/actions'
import { SchemaService } from '@/domain/schema'

export const readSchema = async (
  resourceType: ResourceType,
  isSystem?: boolean,
) =>
  await withSession(
    async ({ accountId }) =>
      await container
        .resolve(SchemaService)
        .readSchema(accountId, resourceType, isSystem),
  )
