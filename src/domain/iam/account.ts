'use server'

import { faker } from '@faker-js/faker'
import { applyTemplate } from '../schema/template/actions'
import { getDownloadPath } from '../blobs/utils'
import { Account } from './types'
import prisma from '@/lib/prisma'

export const createAccount = async (): Promise<void> => {
  const key = faker.string.alpha({ casing: 'lower', length: 5 })
  const { id: accountId } = await prisma().account.create({
    data: {
      key,
      name: `New Account - ${key}`,
    },
  })

  await applyTemplate(accountId)
}

export const readAccount = async (
  accountId: string,
): Promise<Account | undefined> => {
  const account = await prisma().account.findUnique({
    where: {
      id: accountId,
    },
    include: {
      LogoBlob: true,
    },
  })

  if (!account) return

  const logoPath =
    account.LogoBlob &&
    getDownloadPath({
      blobId: account.LogoBlob.id,
      mimeType: account.LogoBlob.mimeType,
      fileName: 'logo',
    })

  return {
    id: account.id,
    key: account.key,
    name: account.name,
    address: account.address,
    logoPath,
  }
}

export const deleteAccount = async (accountId: string): Promise<void> => {
  await prisma().account.delete({
    where: {
      id: accountId,
    },
  })
}
