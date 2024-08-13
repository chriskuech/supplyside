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

const ConsentCard: FC = () => {
  const [checked, setChecked] = useState<boolean>(false)

  return (
    <Card>
      <CardHeader title={'Terms & Conditions'} />
      <CardContent>
        <Stack spacing={4}>
          <Typography>
            Please accept our Terms &amp; Conditions and Privacy Policy to
            continue.
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={checked} />}
            label={
              <>
                Accept{' '}
                <Link href={'https://www.supplyside.io/privacy'}>
                  Privacy Policy
                </Link>{' '}
                and{' '}
                <Link href={'https://www.supplyside.io/terms-of-service'}>
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
