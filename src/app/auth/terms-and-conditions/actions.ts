'use server'

import { RedirectType, redirect } from 'next/navigation'
import { container } from 'tsyringe'
import { readSession } from '@/lib/session/actions'
import { PrismaService } from '@/integrations/PrismaService'

export const acceptTermsAndConditions = async () => {
  const { userId } = await readSession()
  const prisma = container.resolve(PrismaService)

  await prisma.user.update({
    where: { id: userId },
    data: {
      tsAndCsSignedAt: new Date(),
    },
  })

  redirect('/', RedirectType.replace)
}
