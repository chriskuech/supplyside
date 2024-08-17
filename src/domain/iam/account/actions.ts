'use server'

import { faker } from '@faker-js/faker'
import { applyTemplate } from '../../schema/template/actions'
import { Account, accountInclude, mapAccountModel } from './types'
import prisma from '@/lib/prisma'

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

  return mapAccountModel(model)
}

export const deleteAccount = async (accountId: string): Promise<void> => {
  await prisma().account.delete({
    where: {
      id: accountId,
    },
  })
}
