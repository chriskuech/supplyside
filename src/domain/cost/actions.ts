'use server'

import { Cost } from '@prisma/client'
import prisma from '@/lib/prisma'

export const readCosts = async (resourceId: string): Promise<Cost[]> =>
  await prisma().cost.findMany({
    where: {
      resourceId,
    },
    select: {
      id: true,
      resourceId: true,
      name: true,
      isPercentage: true,
      value: true,
      createdAt: true,
      updatedAt: true,
      Resource: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

export const updateCost = async (id: string, updatedData: Partial<Cost>) => {
  try {
    const updatedCost = await prisma().cost.update({
      where: { id },
      data: updatedData,
    })
    return updatedCost
  } catch (error) {
    console.error('Error updating cost:', error)
    throw error
  }
}

export const createCost = async (data: Cost) => {
  try {
    const newCost = await prisma().cost.create({
      data,
    })
    return newCost
  } catch (error) {
    console.error('Error creating cost:', error)
    throw error
  }
}

export const deleteCost = async (id: string): Promise<void> => {
  await prisma().cost.delete({
    where: {
      id,
    },
  })
}
