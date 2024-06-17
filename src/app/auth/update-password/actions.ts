'use server'

import { hash } from 'bcrypt'
import { config } from '@/lib/config'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/session'

export const updatePassword = async (password: string) => {
  const { userId } = await requireSession()

  const passwordHash = await hash(password, config.SALT)

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      requirePasswordReset: false,
    },
  })
}
