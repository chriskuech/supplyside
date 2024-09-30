import { Session } from './entity'
import {Session as SessionModel} from '@prisma/client'

export const mapSessionModelToEntity = (model: SessionModel): Session => ({
  id: model.id,
  accountId: model.accountId,
  userId: model.userId,
  expiresAt: model.expiresAt.toISOString(),
})
