
export type PartModel = {
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
