'use server'

import { hash } from 'bcrypt'
import { RedirectType, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/session'

export const updatePassword = async (password: string) => {
  const { userId } = await requireSession()

  await prisma().user.update({
    where: { id: userId },
    data: {
      passwordHash: await hash(password, 12),
      requirePasswordReset: false,
    },
  })

  redirect('/', RedirectType.replace)
}
