import { Option, ValueResource } from '@supplyside/model'

export type PartModel = {
  id: string
  jobKey: number
  name: string | null
  needBy: Date | null
  paymentDue: Date | null
  totalCost: number | null
  customer: ValueResource | null
  jobStatusOption: Option | null
  steps: {
    id: string
    isFirst: boolean
    isLast: boolean
    type: 'Purchase' | 'WorkCenter'
    start: Date | null
    days: number | null
  }[]
}
