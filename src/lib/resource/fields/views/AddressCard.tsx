import { Home } from '@mui/icons-material'
import { Card, Box, Typography } from '@mui/material'
import { Address } from '@/domain/resource/entity'

const formatAddress = (address: Address): string => {
  const parts = [
    address.streetAddress,
    address.city,
    address.state,
    address.zip,
    address.country,
  ].filter(Boolean)
  return parts.join(', ')
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
    return <Typography>{formatAddress(address)}</Typography>
  }

  return (
    <Card variant="outlined">
      <Box sx={{ display: 'flex', flexDirection: 'row', padding: 2 }}>
        <Box sx={{ marginRight: 2 }}>
          <Home sx={{ color: 'action.active' }} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body1">
            {[address.streetAddress, address.city].filter(Boolean).join(', ')}
          </Typography>
          <Typography variant="body1">
            {[address.state, address.zip, address.country]
              .filter(Boolean)
              .join(', ')}
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}
