import { Alert } from '@mui/material'
import { readAccount } from '@/client/account'
import CopyableTextInput from '@/lib/ux/CopyableTextInput'
import { requireSession } from '@/session'
import { config } from '@/config'

export const BillsInboxControl = async () => {
  const { accountId } = await requireSession()
  const account = await readAccount(accountId)

  if (!account) return <Alert severity="error">Failed to load</Alert>

  return (
    <CopyableTextInput
      key={CopyableTextInput.name}
      label="Bills Inbox"
      content={`${account.key}@${config().BILLS_EMAIL_DOMAIN}`}
    />
  )
}
