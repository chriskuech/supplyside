import { Box, Stack } from '@mui/material'
import { OptionTemplate } from '@supplyside/model'
import { zip } from 'remeda'

type Props = {
  statuses: OptionTemplate[]
  currentStatus: OptionTemplate
  successStatus: OptionTemplate
  failStatus: OptionTemplate
}

export default function StatusTrackerView({
  statuses: allStatuses,
  currentStatus,
  successStatus,
  failStatus,
}: Props) {
  const happyPath = allStatuses.filter(
    (status) => status.templateId !== failStatus.templateId,
  )
  const sadPath = allStatuses.filter(
    (status) => status.templateId !== successStatus.templateId,
  )

  const path =
    currentStatus.templateId === failStatus.templateId ? sadPath : happyPath
  const activeIndex = path.findIndex(
    (status) => status.templateId === currentStatus.templateId,
  )

  const statusPairs = zip(path, [...path.slice(1), undefined])

  return (
    <Stack direction="row" height={70}>
      {statusPairs.map(([current, next], i) => {
        const isActive = i === activeIndex
        const isLast = i === path.length - 1

        return (
          <>
            <Stack
              justifyContent="center"
              sx={{
                backgroundColor: current.color,
                borderTopRightRadius: isLast ? '50%' : undefined,
                borderBottomRightRadius: isLast ? '50%' : undefined,
              }}
              color={!isActive ? 'rgba(255, 255, 255, 0.6)' : 'white'}
              fontWeight="bold"
              fontSize="1.2em"
              overflow="visible"
              height={70}
            >
              <Box
                ml={i > 0 ? -2 : 4}
                pr={!next ? 3 : 1}
                sx={{ textShadow: '0 1px 5px rgba(0, 0, 0, 0.2)' }}
                width="fit-content"
              >
                {current.name}
              </Box>
            </Stack>

            {next && (
              <Box height="100%" width="min-content" flexShrink={0}>
                <svg
                  viewBox="0 0 50 50"
                  style={{ height: '100%', width: 'auto' }}
                >
                  <defs>
                    <linearGradient id={`bg-${i + 1}`}>
                      <stop offset="0%" stopColor={next.shadowColor} />
                      <stop offset="100%" stopColor={next.color} />
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
                    style={{ fill: current.color }}
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
