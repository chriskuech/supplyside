import { LogoutForm } from './LogoutForm'
import { handleLogout } from './actions'

export default async function Logout() {
  return <LogoutForm onLogout={handleLogout} />;
}
