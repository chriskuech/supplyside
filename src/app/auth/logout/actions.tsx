'use server'

import { RedirectType, redirect } from 'next/navigation'
import { clearSession } from '@/domain/iam/session'

export const handleLogout = async () => {
  clearSession()

  redirect('/', RedirectType.replace)
}
