import { Home } from '@mui/icons-material'
import { Card, Box, Typography, Stack } from '@mui/material'
import { Address } from '@/domain/resource/entity'

export const formatInlineAddress = (address: Address): string => {
  const { streetAddress, city, state, zip, country } = address

  const stateZip = [state, zip].filter(Boolean).join(' ')

  return [streetAddress, city, stateZip, country].filter(Boolean).join(', ')
}

const formatAddress = (address: Address) => {
  const { streetAddress, city, state, zip, country } = address

  const cityState = city && state ? `${city}, ${state}` : city || state

  const cityStateZip = [cityState, zip].filter(Boolean).join(' ')

  return { streetAddress, cityStateZip, country }
}

type Props = {
  address: Address
  inline?: boolean
}

export default function AddressCard({ address, inline }: Props) {
  if (!address || !Object.values(address).some(Boolean)) {
    return <Typography color="text.secondary">No address provided</Typography>
  }

  if (inline) {
    return <Typography>{formatInlineAddress(address)}</Typography>
  }

  const { streetAddress, cityStateZip, country } = formatAddress(address)

  return (
    <Card variant="outlined">
      <Stack direction="row" p={2}>
        <Box sx={{ marginRight: 2 }}>
          <Home sx={{ color: 'action.active' }} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {streetAddress && (
            <Typography variant="body1">{streetAddress}</Typography>
          )}
          {cityStateZip && (
            <Typography variant="body1">{cityStateZip}</Typography>
          )}
          {country && <Typography variant="body1">{country}</Typography>}
        </Box>
      </Stack>
    </Card>
  )
}
