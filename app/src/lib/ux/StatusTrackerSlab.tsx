import { Stack, Box, Container } from '@mui/material'
import { OptionTemplate, Option } from '@supplyside/model'
import { FC, PropsWithChildren } from 'react'
import StatusTrackerView from './StatusTrackerView'

type Props = {
  statuses: OptionTemplate[]
  currentStatus: Option
  successStatus: OptionTemplate
  failStatus: OptionTemplate
}

export const StatusTrackerSlab: FC<PropsWithChildren<Props>> = ({
  statuses,
  currentStatus: currentStatusOption,
  successStatus,
  failStatus,
  children,
}) => {
  const currentStatus = statuses.find(
    (s) => s.templateId === currentStatusOption.templateId,
  )

  if (!currentStatus) {
    return '❌ Current status not found'
  }

  return (
    <Stack direction="row" height={100}>
      <Box
        flexGrow={1}
        height={70}
        my="15px"
        sx={{
          background: `linear-gradient(90deg, ${currentStatus.shadowColor} 0%, ${currentStatus.color} 100%)`,
        }}
      />
      <Container sx={{ flexShrink: 0 }} disableGutters>
        <Stack
          direction="row"
          sx={{ overflowX: 'hidden', height: 100 }}
          alignItems="center"
        >
          <Box sx={{ borderRadius: 10, flexGrow: 1 }}>
            <StatusTrackerView
              statuses={statuses}
              currentStatus={currentStatus}
              successStatus={successStatus}
              failStatus={failStatus}
            />
          </Box>
          <Stack
            direction="row"
            justifyContent="end"
            alignItems="center"
            spacing={2}
            mr={3}
          >
            {children}
          </Stack>
        </Stack>
      </Container>
      <Box flexGrow={1} bgcolor="transparent" />
    </Stack>
  )
}
