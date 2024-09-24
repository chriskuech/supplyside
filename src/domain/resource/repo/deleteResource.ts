import { fields } from '../../schema/template/system-fields'
import { recalculateSubtotalCost } from '../costs'
import { selectResourceFieldValue } from '../extensions'
import { mapResourceModelToEntity } from '../mappers'
import { resourceInclude } from '../model'
import prisma from '@/services/prisma'

export type DeleteResourceParams = {
  accountId: string
  id: string
}

export const deleteResource = async ({
  accountId,
  id,
}: DeleteResourceParams): Promise<void> => {
  const model = await prisma().resource.delete({
    where: { id, accountId },
    include: resourceInclude,
  })

  const entity = mapResourceModelToEntity(model)
  if (entity.type === 'Line') {
    const orderId = selectResourceFieldValue(entity, fields.order)?.resource?.id
    const billId = selectResourceFieldValue(entity, fields.bill)?.resource?.id

    await Promise.all([
      orderId && recalculateSubtotalCost(accountId, 'Order', orderId),
      billId && recalculateSubtotalCost(accountId, 'Bill', billId),
    ])
  }
}
