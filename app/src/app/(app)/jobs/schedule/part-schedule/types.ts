import { Option, ValueResource } from '@supplyside/model'

export type JobGroup = {
  type: 'Job'
  jobId: string
  jobKey: number
  jobName: string
  jobPath: string
  customerName: string
  customerPoNumber: string
  jobStatusOption: Option | null
  needBy: Date
  parts: PartModel[]
}

export type WorkCenterGroup = {
  type: 'WorkCenter'
  workCenterId: string
  workCenterName: string
  workCenterPath: string
  needBy: Date
  parts: PartModel[]
}

export type PartModel = {
  id: string
  jobId: string
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
    linkedResource: ValueResource | null
    start: Date | null
    days: number | null
  }[]
}
