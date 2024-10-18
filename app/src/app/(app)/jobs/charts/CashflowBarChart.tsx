'use client'

import {
  BarPlot,
  BarSeriesType,
  ChartsReferenceLine,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  ResponsiveChartContainer,
} from '@mui/x-charts'
import { groupBy, sumBy } from 'remeda'
import { fields, Resource, selectResourceFieldValue } from '@supplyside/model'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isBetween from 'dayjs/plugin/isBetween'
import { useMemo } from 'react'
import { ChartsNoDataOverlay } from '@mui/x-charts/ChartsOverlay'
import { formatMoney } from '@/lib/format'

dayjs.extend(weekOfYear)
dayjs.extend(isBetween)

type Props = {
  resources: Resource[]
}

export default function CashflowBarChart({ resources }: Props) {
  const orderedPaymentDates = resources
    .filter(
      (resource) =>
        !!selectResourceFieldValue(resource, fields.paymentDueDate)?.date,
    )
    .map(
      (resource) =>
        selectResourceFieldValue(resource, fields.paymentDueDate)?.date,
    )
    .sort((date1, date2) => (dayjs(date1).isBefore(date2) ? -1 : 1))

  const minDate = dayjs(orderedPaymentDates[0])
  const maxDate = dayjs(orderedPaymentDates[orderedPaymentDates.length - 1])

  const numberOfWeeks = useMemo(
    () => Math.ceil(maxDate.diff(minDate, 'week', true)),
    [minDate, maxDate],
  )
  const startDate = useMemo(() => minDate.day(1), [minDate])
  const startDateWeekNumber = useMemo(() => startDate.week(), [startDate])

  const weeks = useMemo((): string[] => {
    const data = [...Array(numberOfWeeks).keys()].map((number) =>
      startDate.week(startDateWeekNumber + number).format('MM/DD/YYYY'),
    )

    return data
  }, [startDate, startDateWeekNumber, numberOfWeeks])

  const series = useMemo((): BarSeriesType['data'] => {
    if (!resources) return []

    const resourcesToShow = resources.filter(
      (resource) =>
        !!selectResourceFieldValue(resource, fields.paymentDueDate)?.date,
    )

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
  }, [weeks, resources])

  const currentWeek = useMemo(() => {
    const today = dayjs(new Date())
    return weeks.find((week) => today.day(1).isSame(dayjs(week), 'd'))
  }, [weeks])

  return (
    <ResponsiveChartContainer
      sx={{ padding: 1, marginLeft: 2, overflow: 'visible' }}
      series={[
        {
          data: series,
          type: 'bar',
          valueFormatter: (value) =>
            formatMoney(value, { maximumFractionDigits: 0 }) ?? '',
        },
      ]}
      xAxis={[{ data: weeks, scaleType: 'band' }]}
      yAxis={[
        {
          valueFormatter: (value) =>
            formatMoney(value, { maximumFractionDigits: 0 }) ?? '',
        },
      ]}
    >
      <BarPlot />
      <ChartsTooltip />
      <ChartsXAxis />
      <ChartsYAxis />
      {currentWeek && (
        <ChartsReferenceLine
          x={currentWeek}
          lineStyle={{ stroke: 'red' }}
          labelStyle={{ fontSize: '12', stroke: 'red' }}
          label="today"
          labelAlign="start"
        />
      )}
      {!series?.length && <ChartsNoDataOverlay />}
    </ResponsiveChartContainer>
  )
}
