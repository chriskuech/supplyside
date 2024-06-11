'use server'

import { fail } from 'assert'
import { hash } from 'bcrypt'
import { config } from '@/lib/config'
import prisma from '@/lib/prisma'
import { readSession } from '@/lib/auth'

export const updatePassword = async (password: string) => {
  const session = (await readSession()) ?? fail()

  const passwordHash = await hash(password, config.SALT)

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      passwordHash,
      requirePasswordReset: false,
    },
  })
}
