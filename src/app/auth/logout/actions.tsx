'use server'

import { RedirectType, redirect } from 'next/navigation'
import { clearSession } from '@/lib/iam/actions'

export const handleLogout = async () => {
  clearSession()

  redirect('/', RedirectType.replace)
}
