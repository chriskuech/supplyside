'use server'

import { RedirectType, redirect } from 'next/navigation'
import { clearSession } from '@/lib/auth'

export const handleLoout = async () => {
  clearSession()

  redirect('/', RedirectType.replace)
}
