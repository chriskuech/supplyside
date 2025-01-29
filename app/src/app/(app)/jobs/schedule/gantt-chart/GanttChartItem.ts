export type GanttChartEventState = {
  isDragging: boolean
}

export type GanttChartEvent = {
  id: string
  days: number
  startDate: Date
  onChange?: (event: { days?: number; startDate?: Date }) => void
  children: (state: GanttChartEventState) => React.ReactNode
}

export type GanttChartGroup = {
  id: string
  label: React.ReactNode
  items: GanttChartItem[]
}

export type GanttChartItem = {
  id: string
  label: React.ReactNode
  events: GanttChartEvent[]
}
