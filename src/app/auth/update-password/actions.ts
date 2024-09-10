'use server'

import { hash } from 'bcrypt'
import { RedirectType, redirect } from 'next/navigation'
import { testHas6Characters, testHasOneLetter } from './utils'
import prisma from '@/services/prisma'
import { readSession } from '@/lib/session/actions'
import { ExpectedError } from '@/domain/errors'

export const updatePassword = async (password: string) => {
  const { userId } = await readSession()

  if (!testHas6Characters(password) || !testHasOneLetter(password)) {
    throw new ExpectedError('Password is not valid')
  }

  await prisma().user.update({
    where: { id: userId },
    data: {
      passwordHash: await hash(password, 12),
      requirePasswordReset: false,
    },
  })

  redirect('/', RedirectType.replace)
}
