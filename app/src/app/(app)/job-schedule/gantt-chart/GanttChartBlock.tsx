import { Box } from '@mui/material'

export type GanttChartBlockProps = {
  startDate: Date
  length: number
  children: React.ReactNode
}

export const GanttChartBlock = ({ children }: GanttChartBlockProps) => (
  <Box position="absolute">{children}</Box>
)
