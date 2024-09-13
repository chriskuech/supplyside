import { faker } from '@faker-js/faker'
import { Account } from './entity'
import { mapAccountModelToEntity } from './mappers'
import { accountInclude } from './model'
import { applyTemplate } from '@/domain/schema/template'
import prisma from '@/services/prisma'
import 'server-only'

export const createAccount = async (): Promise<void> => {
  const temporaryKey = faker.string.alpha({ casing: 'lower', length: 5 })

  const { id: accountId } = await prisma().account.create({
    data: {
      key: temporaryKey,
      name: 'New Account - ' + temporaryKey,
    },
  })

  await applyTemplate(accountId)
}

export const readAccount = async (accountId: string): Promise<Account> => {
  const model = await prisma().account.findUniqueOrThrow({
    where: {
      id: accountId,
    },
    include: accountInclude,
  })

  return mapAccountModelToEntity(model)
}

export const deleteAccount = async (accountId: string): Promise<void> => {
  await prisma().account.delete({
    where: {
      id: accountId,
    },
  })
}
