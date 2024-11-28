import { Option, ValueResource } from '@supplyside/model'

export type PartModel = {
  id: string
  jobKey: number
  name: string | null
  needBy: Date | null
  paymentDue: Date | null
  totalCost: number | null
  customer: ValueResource | null
  customerPoNumber: string | null
  quantity: number | null
  jobStatusOption: Option | null
  steps: {
    id: string
    isFirst: boolean
    isLast: boolean
    isCompleted: boolean
    type: 'Purchase' | 'WorkCenter'
    start: Date | null
    days: number | null
  }[]
}
