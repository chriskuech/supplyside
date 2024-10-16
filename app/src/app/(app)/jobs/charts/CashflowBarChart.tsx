'use client'

import { BarChart, BarSeriesType } from '@mui/x-charts'
import { groupBy, sumBy } from 'remeda'
import { fields, Resource, selectResourceFieldValue } from '@supplyside/model'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isBetween from 'dayjs/plugin/isBetween'
import { useMemo } from 'react'
import { formatMoney } from '@/lib/format'

dayjs.extend(weekOfYear)
dayjs.extend(isBetween)

const NUMBER_OF_WEEKS = 7

type Props = {
  resources: Resource[]
}

export default function CashflowBarChart({ resources }: Props) {
  const currentWeek = useMemo(() => dayjs(new Date()).day(1), [])
  const currentWeekNumber = useMemo(() => currentWeek.week(), [currentWeek])

  const weeks = useMemo((): string[] => {
    const data = [...Array(NUMBER_OF_WEEKS).keys()].map((number) =>
      currentWeek.week(currentWeekNumber + number).format('MM/DD/YYYY'),
    )

    return data
  }, [currentWeek, currentWeekNumber])

  const series = useMemo((): BarSeriesType['data'] => {
    if (!resources) return []

    const resourcesToShow = resources.filter((resource) => {
      const paymentDueDate = selectResourceFieldValue(
        resource,
        fields.paymentDueDate,
      )?.date

      if (!paymentDueDate) return false

      const lastWeekToShow = currentWeek.week(
        currentWeekNumber + NUMBER_OF_WEEKS,
      )

      return dayjs(paymentDueDate).isBetween(currentWeek, lastWeekToShow)
    })

    const resourcesGroupedByWeek = groupBy(resourcesToShow, (resource) => {
      const paymentDueDate = selectResourceFieldValue(
        resource,
        fields.paymentDueDate,
      )?.date

      return weeks.find((week, i) => {
        const weekDate = dayjs(week)
        if (!weeks[i + 1]) return true
        const nextWeekDate = dayjs(weeks[i + 1])

        return dayjs(paymentDueDate).isBetween(weekDate, nextWeekDate)
      })
    })

    return weeks.map((week) =>
      sumBy(
        resourcesGroupedByWeek[week] ?? [],
        (resource) =>
          selectResourceFieldValue(resource, fields.totalCost)?.number ?? 0,
      ),
    )
  }, [currentWeek, currentWeekNumber, weeks, resources])

  return (
    <BarChart
      sx={{ padding: 1 }}
      xAxis={[{ data: weeks, scaleType: 'band' }]}
      yAxis={[{ valueFormatter: (value) => formatMoney(value) ?? '' }]}
      series={[
        { data: series, valueFormatter: (value) => formatMoney(value) ?? '' },
      ]}
    />
  )
}
