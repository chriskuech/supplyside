'use server'

import { hash } from 'bcrypt'
import { RedirectType, redirect } from 'next/navigation'
import prisma from '@/services/prisma'
import { readSession } from '@/lib/iam/actions'

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
