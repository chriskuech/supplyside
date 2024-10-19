import { Home } from '@mui/icons-material'
import { Card, Box, Typography, Stack } from '@mui/material'
import { Address } from '@supplyside/model'

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

  const { streetAddress, cityStateZip, country } = formatAddress(address)

  if (inline) {
    return (
      <Stack>
        {streetAddress && (
          <Typography variant="caption">{streetAddress}</Typography>
        )}
        {cityStateZip && (
          <Typography variant="caption">
            {cityStateZip}
            {country ? ` ${country}` : ''}
          </Typography>
        )}
      </Stack>
    )
  }

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
