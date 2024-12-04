import { fail } from 'assert'
import dayjs, { Dayjs } from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear.js'
import isBetween from 'dayjs/plugin/isBetween.js'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js'
import { match } from 'ts-pattern'
import { fields, intervalUnits } from '../templates'
import { Resource } from '../types'
import { selectResourceFieldValue } from './resource'

dayjs.extend(isBetween)
dayjs.extend(isSameOrAfter)
dayjs.extend(dayOfYear)

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

  const offsetInDays = recurrenceIntervalOffsetInDays ?? 0

  if (
    !recurrenceInterval ||
    !recurrenceIntervalUnitTemplateId ||
    !recurrenceStartedAt
  )
    return null

  const parsedRecurrenceInterval = Math.ceil(recurrenceInterval)
  if (recurrenceInterval < 1) return

  // Calculate first trigger date
  if (
    !date &&
    (!recurrenceLastExecutionDate ||
      dayjs(recurrenceStartedAt).isAfter(dayjs(recurrenceLastExecutionDate)))
  ) {
    const recurrenceStartDate = dayjs(recurrenceStartedAt)

    return match(recurrenceIntervalUnitTemplateId)
      .with(intervalUnits.days.templateId, () =>
        recurrenceStartDate.add(parsedRecurrenceInterval, 'day'),
      )
      .with(intervalUnits.weeks.templateId, () => {
        if (recurrenceStartDate.day() <= offsetInDays) {
          return recurrenceStartDate.set('day', offsetInDays)
        }

        return recurrenceStartDate
          .add(parsedRecurrenceInterval, 'week')
          .set('day', offsetInDays)
      })
      .with(intervalUnits.months.templateId, () => {
        if (recurrenceStartDate.date() <= offsetInDays) {
          return recurrenceStartDate.set('date', offsetInDays)
        }

        return recurrenceStartDate
          .add(parsedRecurrenceInterval, 'month')
          .set('date', offsetInDays)
      })
      .with(intervalUnits.years.templateId, () => {
        if (recurrenceStartDate.dayOfYear() <= offsetInDays) {
          return recurrenceStartDate.dayOfYear(offsetInDays)
        }

        return recurrenceStartDate
          .add(parsedRecurrenceInterval, 'year')
          .set('date', offsetInDays)
      })
      .otherwise(() => fail('Interval unit option not supported'))
  }

  const lastExecutionDate = date || dayjs(recurrenceLastExecutionDate)

  return match(recurrenceIntervalUnitTemplateId)
    .with(intervalUnits.days.templateId, () =>
      dayjs(lastExecutionDate).add(parsedRecurrenceInterval, 'day'),
    )
    .with(intervalUnits.weeks.templateId, () =>
      dayjs(lastExecutionDate)
        .add(parsedRecurrenceInterval, 'week')
        .set('day', offsetInDays),
    )
    .with(intervalUnits.months.templateId, () =>
      dayjs(lastExecutionDate)
        .add(parsedRecurrenceInterval, 'month')
        .set('date', offsetInDays),
    )
    .with(intervalUnits.years.templateId, () =>
      dayjs(lastExecutionDate)
        .add(parsedRecurrenceInterval, 'year')
        .set('date', offsetInDays),
    )
    .otherwise(() => fail('Interval unit option not supported'))
}
