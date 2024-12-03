import assert from 'assert'
import { entries, filter, isTruthy, map, mapValues, pipe, sortBy } from 'remeda'
import { groupBy } from 'remeda'
import { JobGroup, PartModel, WorkCenterGroup } from './types'

export const groupByJob = (parts: PartModel[]): JobGroup[] =>
  pipe(
    parts,
    groupBy((p) => p.jobKey),
    mapValues((parts) => sortBy(parts, (p) => p.needBy ?? new Date(0))),
    entries(),
    map(([jobKey, parts]): JobGroup => {
      const part = parts.at(0)
      assert(part, 'No parts in job')

      return {
        type: 'Job',
        jobId: part.jobId,
        jobKey: Number(jobKey),
        jobName: part.name ?? '',
        jobPath: `/jobs/${jobKey}`,
        customerName: part.customer?.name ?? '',
        customerPoNumber: part.customerPoNumber ?? '',
        jobStatusOption: part.jobStatusOption,
        needBy: part.needBy ?? new Date(0),
        parts,
      }
    }),
  )

export const groupByWorkCenter = (parts: PartModel[]): WorkCenterGroup[] =>
  pipe(
    parts,
    map((part) => {
      const step = part.steps.at(0)
      if (!step) return null
      if (step.type !== 'WorkCenter') return null

      return {
        workCenterId: step.linkedResource?.id,
        workCenterName: step.linkedResource?.name ?? null,
        part,
      }
    }),
    filter(isTruthy),
    groupBy(({ workCenterId }) => workCenterId),
    entries(),
    map(([workCenterId, items]): WorkCenterGroup => {
      const item = items.at(0)
      assert(item, 'No items in work center')

      const parts = pipe(
        items,
        map((item) => item.part),
        sortBy((p) => p.needBy ?? new Date(0)),
      )

      const firstPart = parts.at(0)
      assert(firstPart, 'No parts in work center')

      return {
        type: 'WorkCenter',
        workCenterId,
        workCenterName: item.workCenterName ?? '',
        workCenterPath: `?drawerResourceId=${workCenterId}`,
        needBy: firstPart.needBy ?? new Date(0),
        parts,
      }
    }),
  )
