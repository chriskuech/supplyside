'use client'

import { fail } from 'assert'
import { Stack, Box, Container, useTheme } from '@mui/material'
import { OptionTemplate, Option } from '@supplyside/model'
import { FC, PropsWithChildren } from 'react'
import { zip } from 'remeda'
import Color from 'color'
import { match } from 'ts-pattern'

const height = 62

const shadow = (color: string = fail('color')) =>
  Color(color).darken(0.5).rgb().string()
const highlight = (color: string = fail('color')) =>
  Color(color).lighten(0.2).rgb().string()

type StatusTrackerSlabProps = {
  statuses: OptionTemplate[]
  currentStatus: Option
  successStatus: OptionTemplate
  failStatus: OptionTemplate
}

export const StatusTrackerSlab: FC<
  PropsWithChildren<StatusTrackerSlabProps>
> = ({
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

  const color =
    currentStatus.templateId === statuses[0]?.templateId
      ? highlight(currentStatus.color)
      : shadow(currentStatus.color)

  return (
    <Stack direction="row" alignItems="center">
      <Box
        flexGrow={1}
        height={height}
        sx={{
          background: `linear-gradient(90deg, ${shadow(color)} 0%, ${color} 100%)`,
        }}
      />
      <Container sx={{ flexShrink: 0 }} disableGutters>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box sx={{ flexGrow: 1 }} height={height}>
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
            flexShrink={0}
          >
            {children}
          </Stack>
        </Stack>
      </Container>
      <Box flexGrow={1} bgcolor="transparent" />
    </Stack>
  )
}

type StatusTrackerViewProps = {
  statuses: OptionTemplate[]
  currentStatus: OptionTemplate
  successStatus: OptionTemplate
  failStatus: OptionTemplate
}

const StatusTrackerView: FC<StatusTrackerViewProps> = ({
  statuses: allStatuses,
  currentStatus,
  successStatus,
  failStatus,
}) => {
  const {
    palette: { mode: theme },
  } = useTheme()

  const inactiveColor = match(theme)
    .with('light', () => '#cccccc')
    .with('dark', () => '#333333')
    .exhaustive()

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
    <Stack direction="row" height="100%">
      {statusPairs.map(([current, next], i) => {
        const isFirst = i === 0
        const isLast = i === path.length - 1
        const isActive = i === activeIndex
        const isFuture = i > activeIndex
        const isNextActive = i + 1 === activeIndex
        const isNextFuture = i + 1 > activeIndex

        const currentColor = isFuture
          ? inactiveColor
          : isActive
            ? highlight(currentStatus.color)
            : shadow(currentStatus.color)

        const nextColor = isNextFuture
          ? inactiveColor
          : isNextActive
            ? highlight(currentStatus.color)
            : shadow(currentStatus.color)

        return (
          <>
            <Stack
              justifyContent="center"
              sx={{
                backgroundColor: currentColor,
                pl: isFirst ? 4 : 0,
                textShadow: `0 1px 5px rgba(0 0 0 / ${isActive ? 0.5 : 0.2})`,
                height: '100%',
              }}
              color={!isActive ? 'rgba(255, 255, 255, 0.6)' : 'white'}
              fontWeight="bold"
              fontSize="1.2em"
            >
              <Box
                sx={{
                  ml: !isFirst ? -2 : 0,
                }}
                width="max-content"
              >
                {current.name}
              </Box>
            </Stack>

            {next && nextColor && (
              <Box height="100%" width={height} flexShrink={0}>
                <svg
                  viewBox={`0 0 ${height} ${height}`}
                  style={{ height: '100%', width: 'auto' }}
                >
                  <defs>
                    <linearGradient id={`bg-${i + 1}`}>
                      <stop offset="0%" stopColor={shadow(nextColor)} />
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
                    points={`0,0 ${height / 2},${height / 2} 0,${height}`}
                    style={{ fill: currentColor }}
                  />
                </svg>
              </Box>
            )}

            {isLast && (
              <Box
                height="100%"
                width={height}
                flexShrink={0}
                sx={{
                  borderTopRightRadius: '50%',
                  borderBottomRightRadius: '50%',
                  backgroundColor: currentColor,
                  position: 'relative',
                  left: `-${height / 2}px`,
                  clipPath: `polygon(49% 0, 100% 0, 100% 100%, 49% 100%)`,
                }}
              />
            )}
          </>
        )
      })}
    </Stack>
  )
}
