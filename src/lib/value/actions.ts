'use server'

import { Prisma, Value } from '@prisma/client'
import prisma from '@/lib/prisma'

export const createValue = (data: Prisma.ValueCreateInput): Promise<Value> =>
  prisma().value.create({ data })

export const readValue = (id: string): Promise<Value | null> =>
  prisma().value.findUnique({ where: { id } })
