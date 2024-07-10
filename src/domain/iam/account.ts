'use server'

import { revalidateTag } from 'next/cache'
import { applyTemplate } from '../schema/template/actions'
import { getDownloadPath } from '../blobs/utils'
import { inviteUser } from './user'
import { Account } from './types'
import prisma from '@/lib/prisma'

export const inviteAccount = async (email: string): Promise<void> => {
  const { id: accountId } = await prisma().account.create({
    data: {
      name: `${email}'s Account`,
    },
  })

  await Promise.all([
    inviteUser({ accountId, email, isAdmin: true }),
    applyTemplate(accountId),
  ])

  revalidateTag('iam')
}

export const readAccount = async (
  accountId: string,
): Promise<Account | undefined> => {
  revalidateTag('iam')

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
    name: account.name,
    logoPath,
  }
}

export const deleteAccount = async (accountId: string): Promise<void> => {
  await prisma().account.delete({
    where: {
      id: accountId,
    },
  })

  revalidateTag('iam')
}
