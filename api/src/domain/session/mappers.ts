import { Session } from './entity'

export const mapSessionModelToEntity = (model: Session): Session => ({
  id: model.id,
  accountId: model.accountId,
  userId: model.userId,
  expiresAt: model.expiresAt,
})
