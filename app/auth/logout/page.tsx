import { LogoutForm } from './LogoutForm'
import { handleLoout } from './actions'

export default async function Logout() {
  return <LogoutForm onLogout={handleLoout} />
}
