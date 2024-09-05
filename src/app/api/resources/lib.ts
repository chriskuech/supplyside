import { ResourceType } from '@prisma/client'
import { z } from 'zod'
import { P, match } from 'ts-pattern'
import prisma from '@/services/prisma'

export const resourceTypeSchema = z.enum([
  ResourceType.Bill,
  ResourceType.Item,
  ResourceType.Line,
  ResourceType.Order,
  ResourceType.Vendor,
])

export const keyOrIdSchema = z
  .union([z.coerce.number().int().positive(), z.string().uuid()])
  .transform((value) =>
    match(value)
      .with(P.number, (key) => ({ key, id: undefined }))
      .with(P.string, (id) => ({ id, key: undefined }))
      .exhaustive(),
  )

export const readSession = async (params: { accountId: string }) =>
  await prisma().session.findFirst({
    where: {
      accountId: params.accountId,
    },
  })
