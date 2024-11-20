import PartSchedule from './part-schedule/PartSchedule'

export default async function Page({}: {
  searchParams: Record<string, unknown>
}) {
  return <PartSchedule />
}
