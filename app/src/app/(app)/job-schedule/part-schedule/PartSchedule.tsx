import { getParts } from './actions'
import { PartScheduleGanttChart } from './PartScheduleGanttChart'

export default async function PartSchedule() {
  const parts = await getParts()

  return <PartScheduleGanttChart parts={parts} />
}
