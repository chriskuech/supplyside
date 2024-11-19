import { fail } from 'assert'
import dayjs, { Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import { match } from 'ts-pattern'
import { fields, intervalUnits } from '../templates'
import { Resource } from '../types'
import { selectResourceFieldValue } from './resource'

dayjs.extend(isBetween)
dayjs.extend(isSameOrAfter)

export const getNextResourceCreationDate = (
  recurringResource: Resource,
  date?: Dayjs,
) => {
  const recurrenceIntervalUnitTemplateId = selectResourceFieldValue(
    recurringResource,
    fields.recurrenceIntervalUnits,
  )?.option?.templateId
  const recurrenceInterval = selectResourceFieldValue(
    recurringResource,
    fields.recurrenceInterval,
  )?.number
  const recurrenceIntervalOffsetInDays = selectResourceFieldValue(
    recurringResource,
    fields.recurrenceIntervalOffsetInDays,
  )?.number
  const recurrenceLastExecutionDate = selectResourceFieldValue(
    recurringResource,
    fields.recurrenceLastExecutionDate,
  )?.date
  const recurrenceStartedAt = selectResourceFieldValue(
    recurringResource,
    fields.recurrenceStartedAt,
  )?.date

  const startDate =
    recurrenceLastExecutionDate &&
    recurrenceStartedAt &&
    dayjs(recurrenceStartedAt).isBefore(dayjs(recurrenceLastExecutionDate))
      ? recurrenceLastExecutionDate
      : recurrenceStartedAt

  if (!startDate || !recurrenceInterval || !recurrenceIntervalUnitTemplateId)
    return null

  const lastDate = date || dayjs(startDate)

  return match(recurrenceIntervalUnitTemplateId)
    .with(intervalUnits.days.templateId, () =>
      lastDate.add(recurrenceInterval, 'day'),
    )
    .with(intervalUnits.weeks.templateId, () =>
      lastDate
        .add(recurrenceInterval, 'week')
        .set('day', recurrenceIntervalOffsetInDays ?? 0),
    )
    .with(intervalUnits.months.templateId, () =>
      lastDate
        .add(recurrenceInterval, 'month')
        .set('date', recurrenceIntervalOffsetInDays ?? 0),
    )
    .otherwise(() => fail('Interval unit option not supported'))
}
