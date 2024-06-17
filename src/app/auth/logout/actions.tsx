'use server'

import { RedirectType, redirect } from 'next/navigation'
import { clearSession } from '@/lib/session'

export const handleLoout = async () => {
  clearSession()

  redirect('/', RedirectType.replace)
}
