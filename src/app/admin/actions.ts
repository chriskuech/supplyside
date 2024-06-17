'use server'

import prisma from '@/lib/prisma'

export const inviteAccount = async (email: string) => {
  await prisma.account.create({
    data: {
      name: `${email}'s Account`,
    },
  })
}
