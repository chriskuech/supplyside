'use server'

import { RedirectType, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { requireSession } from '@/lib/session'

export const acceptTermsAndConditions = async () => {
  const { userId } = await requireSession()

  await prisma().user.update({
    where: { id: userId },
    data: {
      tsAndCsSignedAt: new Date(),
    },
  })

  redirect('/', RedirectType.replace)
}
