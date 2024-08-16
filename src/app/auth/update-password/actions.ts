'use server'

import { hash } from 'bcrypt'
import { RedirectType, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { readSession } from '@/lib/iam/session'

export const updatePassword = async (password: string) => {
  const { userId } = await readSession()

  await prisma().user.update({
    where: { id: userId },
    data: {
      passwordHash: await hash(password, 12),
      requirePasswordReset: false,
    },
  })

  redirect('/', RedirectType.replace)
}
