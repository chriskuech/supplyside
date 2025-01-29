'use client'
import { usePlaidLink } from 'react-plaid-link'
import { connect } from '@/actions/plaid'
import LoadingButton from '@/lib/ux/LoadingButton'
import { useAsyncCallback } from '@/hooks/useAsyncCallback'

type Props = {
  linkToken: string
}

export default function PlaidConnectButton({ linkToken }: Props) {
  const [{ isLoading }, createConnection] = useAsyncCallback(connect)
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: createConnection,
  })

  return (
    <LoadingButton
      isLoading={isLoading}
      variant="outlined"
      onClick={() => open()}
      disabled={!ready}
    >
      Connect to Plaid
    </LoadingButton>
  )
}
