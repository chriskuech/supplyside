'use client'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { FC, useState } from 'react'
import { acceptTermsAndConditions } from './actions'
import { privacyPolicyUrl, termsOfServiceUrl } from '@/lib/const'

const ConsentCard: FC = () => {
  const [checked, setChecked] = useState<boolean>(false)

  return (
    <Card>
      <CardHeader title={'Terms of service'} />
      <CardContent>
        <Stack spacing={4}>
          <Typography>
            Please read and accept our Privacy Policy and Terms & Conditions to
            continue to your account
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={checked} />}
            label={
              <>
                Accept{' '}
                <Link href={privacyPolicyUrl} target="_blank">
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link href={termsOfServiceUrl} target="_blank">
                  Terms &amp; Conditions
                </Link>
              </>
            }
            onClick={() => setChecked(!checked)}
          />
          <Stack direction={'row'} justifyContent={'end'}>
            <Button
              onClick={() => acceptTermsAndConditions()}
              disabled={!checked}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ConsentCard
