'use server'

import { revalidatePath } from 'next/cache'
import { faker } from '@faker-js/faker'
import { applyTemplate } from '../schema/template/actions'
import { getDownloadPath } from '../blobs/utils'
import { inviteUser } from './user'
import { Account } from './types'
import prisma from '@/lib/prisma'

export const inviteAccount = async (email: string): Promise<void> => {
  const { id: accountId } = await prisma().account.create({
    data: {
      key: faker.string.alpha({ casing: 'lower', length: 5 }),
      name: `${email}'s Account`,
    },
  })

  await Promise.all([
    inviteUser({ accountId, email, isAdmin: true }),
    applyTemplate(accountId),
  ])

  revalidatePath('')
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

  revalidatePath('')

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

  revalidatePath('')
}
