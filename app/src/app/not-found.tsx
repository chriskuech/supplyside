import { ArrowRight, Email, Home, SupportAgent } from '@mui/icons-material'
import { Button, Stack, Typography } from '@mui/material'
import NextLink from 'next/link'

export default function NotFound() {
  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      height="100%"
      spacing={4}
      width="fit-content"
      margin="auto"
    >
      <Typography variant="h3" width="fit-content">
        404 | Not Found
      </Typography>

      <Typography variant="body2" textAlign="center" width="60%">
        This page does not exist. The URL may be incorrect or the page may have
        been removed.
      </Typography>

      <Stack spacing={1}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Home />}
          endIcon={<ArrowRight />}
          LinkComponent={NextLink}
          href="/"
        >
          Return Home
        </Button>
        <Button
          variant="text"
          size="small"
          startIcon={<SupportAgent />}
          endIcon={<Email />}
          LinkComponent={NextLink}
          href="mailto:support@supplyside.io"
        >
          Contact Support
        </Button>
      </Stack>
    </Stack>
  )
}
