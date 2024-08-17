'use server'

import { RedirectType, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { readSession } from '@/lib/iam/actions'

export const acceptTermsAndConditions = async () => {
  console.log('Accepting terms and conditions')

  const { userId } = await readSession()

  await prisma().user.update({
    where: { id: userId },
    data: {
      tsAndCsSignedAt: new Date(),
    },
  })

  console.log('Terms and conditions accepted')

  redirect('/', RedirectType.replace)
  // revalidatePath('')
}
