import { Session as SessionModel } from '@prisma/client'
import { Session } from './entity'

export const mapSessionModelToEntity = (model: SessionModel): Session => ({
  id: model.id,
  accountId: model.accountId,
  userId: model.userId,
  expiresAt: model.expiresAt.toISOString(),
})
