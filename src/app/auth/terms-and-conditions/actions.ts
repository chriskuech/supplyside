'use server'

import { RedirectType, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { readSession } from '@/lib/iam/session'

export const acceptTermsAndConditions = async () => {
  const { userId } = await readSession()

  await prisma().user.update({
    where: { id: userId },
    data: {
      tsAndCsSignedAt: new Date(),
    },
  })

  redirect('/', RedirectType.replace)
}
