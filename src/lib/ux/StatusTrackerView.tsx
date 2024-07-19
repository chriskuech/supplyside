import { Box, Stack, colors } from '@mui/material'
import { match } from 'ts-pattern'

type Status = 'success' | 'fail' | 'in-progress' | 'not-started'

export const color = (status: Status) =>
  match(status)
    .with('success', () => colors.green)
    .with('fail', () => colors.red)
    .with('in-progress', () => colors.yellow)
    .with('not-started', () => colors.grey)
    .exhaustive()

type Step = {
  label: string
  status: Status
  isActive: boolean
}

type Props = {
  steps: Step[]
}

export default function StatusTrackerView({ steps }: Props) {
  return (
    <Stack direction={'row'} height={100}>
      {steps.map(({ label, status, isActive }, i) => {
        const next = steps[i + 1]
        const currentColor = color(status)[isActive ? '500' : '800']
        const nextColor = next
          ? color(next.status)[next.isActive ? '500' : '800']
          : undefined
        const nextColorShaded = next
          ? color(next.status)[next.isActive ? '700' : '900']
          : undefined

        return (
          <>
            <Stack
              justifyContent={'center'}
              sx={{
                backgroundColor: currentColor,
                borderTopRightRadius: !next ? '50%' : undefined,
                borderBottomRightRadius: !next ? '50%' : undefined,
              }}
              color={!isActive ? 'rgba(255, 255, 255, 0.6)' : 'white'}
              fontWeight={'bold'}
              fontSize={'1.3em'}
              overflow={'visible'}
              height={100}
            >
              <Box
                ml={i > 0 ? -4 : 4}
                mr={!next ? 4 : undefined}
                sx={{ textShadow: '0 1px 5px rgba(0, 0, 0, 0.2)' }}
                width={'fit-content'}
              >
                {label}
              </Box>
            </Stack>

            {nextColor && (
              <Box height={'100%'} width={'min-content'}>
                <svg
                  viewBox="0 0 50 50"
                  style={{ height: '100%', width: 'auto' }}
                >
                  <defs>
                    <linearGradient id={`bg-${i + 1}`}>
                      <stop offset="0%" stopColor={nextColorShaded} />
                      <stop offset="100%" stopColor={nextColor} />
                    </linearGradient>
                  </defs>
                  <rect
                    width="100%"
                    height="100%"
                    x="0"
                    y="0"
                    fill={`url(#bg-${i + 1})`}
                  />
                  <polygon
                    points="0,0 25,25 0,50"
                    style={{ fill: currentColor }}
                  />
                </svg>
              </Box>
            )}
          </>
        )
      })}
    </Stack>
  )
}
