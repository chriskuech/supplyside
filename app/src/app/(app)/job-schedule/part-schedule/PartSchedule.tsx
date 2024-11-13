import { getParts } from './actions'
import { PartScheduleView } from './PartScheduleView'

export default async function PartSchedule() {
  const parts = await getParts()

  return <PartScheduleView parts={parts} />
}
