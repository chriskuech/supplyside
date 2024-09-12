import { LogoutForm } from './LogoutForm'
import { handleLogout } from './actions'
import 'server-only'

export default async function Logout() {
  return <LogoutForm onLogout={handleLogout} />
}
