'use server'

import { revalidateTag } from 'next/cache'
import { applyTemplate } from '../schema/template/actions'
import { inviteUser } from './user'
import prisma from '@/lib/prisma'

export const inviteAccount = async (email: string) => {
  const { id: accountId } = await prisma.account.create({
    data: {
      name: `${email}'s Account`,
    },
  })

  await Promise.all([inviteUser(accountId, email), applyTemplate(accountId)])

  revalidateTag('iam')
}

export const deleteAccount = async (accountId: string) => {
  await prisma.account.delete({
    where: {
      id: accountId,
    },
  })

  revalidateTag('iam')
}
