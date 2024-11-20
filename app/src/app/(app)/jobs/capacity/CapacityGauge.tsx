'use client'

import { Tooltip } from '@mui/material'
import { Gauge } from '@mui/x-charts'
import { FC } from 'react'

type Props = {
  completedStepCount: number
  totalStepCount: number
}

export const CapacityGauge: FC<Props> = ({
  completedStepCount,
  totalStepCount,
}) => (
  <Tooltip
    title={
      <>
        <strong>{completedStepCount}</strong> steps completed
        <br />
        <strong>{totalStepCount - completedStepCount}</strong> steps remaining
        <br />
        <strong>{totalStepCount}</strong> total steps this week
      </>
    }
  >
    <Gauge
      value={completedStepCount}
      valueMin={0}
      valueMax={totalStepCount}
      width={90}
      height={90}
      text={Math.round((completedStepCount / totalStepCount) * 100) + '%'}
    />
  </Tooltip>
)
