'use server'

import { Cost, Prisma } from '@prisma/client'
import { revalidateTag } from 'next/cache'
import prisma from '@/lib/prisma'

export const readCosts = async (resourceId: string): Promise<Cost[]> => {
  revalidateTag('resource')
  return await prisma().cost.findMany({
    where: {
      resourceId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })
}

export const updateCost = async (id: string, data: Prisma.CostUpdateInput) => {
  revalidateTag('resource')
  return await prisma().cost.update({
    where: { id },
    data,
  })
}

export const createCost = async (resourceId: string): Promise<void> => {
  await prisma().cost.create({
    data: { resourceId },
  })
  revalidateTag('resource')
}

export const deleteCost = async (id: string): Promise<void> => {
  revalidateTag('resource')
  await prisma().cost.delete({
    where: {
      id,
    },
  })
}
