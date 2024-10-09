import { RedirectType, redirect } from 'next/navigation'
import { LogoutForm } from './LogoutForm'
import { clearSession } from '@/session'

export default async function Logout() {
  async function handleLogout() {
    'use server'

    await clearSession()
    redirect('/', RedirectType.replace)
  }

  return <LogoutForm onLogout={handleLogout} />
}
