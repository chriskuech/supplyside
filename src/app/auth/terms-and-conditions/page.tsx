import { Box } from '@mui/material'
import ConsentCard from './ConsentCard'

export default function TermsAndConditions() {
  return (
    <Box
      width="100vw"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Box width={500}>
        <ConsentCard />
      </Box>
    </Box>
  )
}
