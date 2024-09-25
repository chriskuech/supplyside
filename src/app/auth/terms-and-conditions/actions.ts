'use server'

import { RedirectType, redirect } from 'next/navigation'
import { container } from 'tsyringe'
import { readSession } from '@/lib/session/actions'
import { UserService } from '@/domain/user'

export const acceptTermsAndConditions = async () => {
  const { accountId, userId } = await readSession()
  const userService = container.resolve(UserService)

  await userService.update(accountId, userId, {
    tsAndCsSignedAt: new Date(),
  })

  redirect('/', RedirectType.replace)
}
