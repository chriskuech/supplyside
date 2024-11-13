export type PartModel = {
  id: string
  jobKey: number
  name: string | null
  steps: {
    id: string
    name: string | null
    start: Date | null
    days: number | null
  }[]
  needBy: Date | null
  paymentDue: Date | null
}
