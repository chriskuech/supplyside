import { Cost } from '@prisma/client'
import prisma from '@/services/prisma'

export const copyCosts = async (
  fromResourceId: string,
  toResourceId: string,
) => {
  const newCosts = await prisma().cost.findMany({
    where: { resourceId: fromResourceId },
  })

  const originalCosts = await prisma().cost.findMany({
    where: { resourceId: toResourceId },
  })

  const costsMatch = (cost1: Cost, cost2: Cost) => cost1.name === cost2.name

  const costs: { newCost: Cost; originalCost?: Cost }[] = newCosts.map(
    (newCost) => {
      const similarCostIndex = originalCosts.findIndex((originalCost) =>
        costsMatch(originalCost, newCost),
      )

      if (similarCostIndex >= 0) {
        const [originalCost] = originalCosts.splice(similarCostIndex, 1)
        return { newCost, originalCost }
      } else {
        return { newCost }
      }
    },
  )

  await Promise.all(
    costs.map(({ newCost, originalCost }) => {
      const newCostData = {
        name: newCost.name,
        isPercentage: newCost.isPercentage,
        value: newCost.value,
      }

      if (originalCost) {
        return prisma().cost.update({
          where: { id: originalCost.id },
          data: newCostData,
        })
      } else {
        return prisma().cost.create({
          data: { ...newCostData, resourceId: toResourceId },
        })
      }
    }),
  )
}
