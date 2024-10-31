'use client'

import {
  BarPlot,
  ChartsReferenceLine,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  ResponsiveChartContainer,
} from '@mui/x-charts'
import {
  filter,
  groupBy,
  isTruthy,
  map,
  pipe,
  sumBy,
  mapValues,
  range,
} from 'remeda'
import {
  billStatusOptions,
  fields,
  Resource,
  selectResourceFieldValue,
} from '@supplyside/model'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isBetween from 'dayjs/plugin/isBetween'
import { useMemo } from 'react'
import { ChartsNoDataOverlay } from '@mui/x-charts/ChartsOverlay'
import { Typography } from '@mui/material'
import { formatMoney } from '@/lib/format'
import { billStatusColors } from '@/lib/constants/status'

dayjs.extend(weekOfYear)
dayjs.extend(isBetween)

type Props = {
  resources: Resource[]
}

export default function CashflowBarChart({ resources }: Props) {
  const today = dayjs(new Date()).day(1)

  const weeks = useMemo((): string[] => {
    const paymentDueDates = resources
      .map(
        (resource) =>
          selectResourceFieldValue(resource, fields.paymentDueDate)?.date,
      )
      .filter(isTruthy)
      .toSorted()
      .map((s) => dayjs(s).day(1))

    const minPaymentDueDate = paymentDueDates.at(0)
    const maxPaymentDueDate = paymentDueDates.at(-1)
    if (!minPaymentDueDate || !maxPaymentDueDate) return []

    const startDate = minPaymentDueDate.isSame(maxPaymentDueDate)
      ? minPaymentDueDate
      : minPaymentDueDate.isBefore(today, 'day')
        ? minPaymentDueDate
        : today

    const endDate = maxPaymentDueDate.isAfter(today, 'day')
      ? maxPaymentDueDate
      : today

    const numberOfWeeks = endDate.diff(startDate, 'w')

    const weeks = range(0, numberOfWeeks || 1).map((number) =>
      startDate.week(startDate.week() + number).format('MM/DD/YYYY'),
    )

    return weeks
  }, [resources, today])

  const totalCosts = useMemo((): {
    statusTemplateId: string
    totalsByWeek: number[]
  }[] => {
    const totalCostByStatusAndWeeks = pipe(
      resources,
      map((resource) => {
        const paymentDueDate = selectResourceFieldValue(
          resource,
          fields.paymentDueDate,
        )?.date
        const totalCost =
          selectResourceFieldValue(resource, fields.totalCost)?.number ?? 0
        const statusTemplateId =
          selectResourceFieldValue(resource, fields.billStatus)?.option
            ?.templateId ?? ''

        if (!paymentDueDate) return null

        return {
          paymentDueDate: dayjs(paymentDueDate).day(1),
          totalCost,
          statusTemplateId,
        }
      }),
      filter(isTruthy),
      map(({ paymentDueDate, totalCost, statusTemplateId }) => ({
        week: weeks.find((week, i) => {
          const weekDate = dayjs(week)
          if (!weeks[i + 1]) return true
          const nextWeekDate = dayjs(weeks[i + 1])
          return paymentDueDate.isBetween(weekDate, nextWeekDate)
        }),
        totalCost,
        statusTemplateId,
      })),
      groupBy(({ statusTemplateId }) => statusTemplateId),
      mapValues((dataByStatus) =>
        pipe(
          dataByStatus,
          groupBy(({ week }) => week),
          mapValues(sumBy(({ totalCost }) => totalCost)),
        ),
      ),
    )

    const totalsByStatuses = Object.entries(totalCostByStatusAndWeeks).map(
      ([key, value]) => ({
        statusTemplateId: key,
        totalsByWeek: weeks.map((week) => value[week] ?? 0),
      }),
    )

    return totalsByStatuses
  }, [weeks, resources])

  const currentWeek = useMemo(
    () => weeks.find((week) => today.isSame(dayjs(week), 'd')),
    [today, weeks],
  )

  const chartHasData = !!totalCosts.length

  return (
    <>
      <Typography variant="h6">Weekly Cashflow</Typography>
      <ResponsiveChartContainer
        sx={{ padding: 1, marginLeft: 2, overflow: 'visible' }}
        series={totalCosts.map((tc) => ({
          type: 'bar',
          stack: 'by status',
          data: tc.totalsByWeek,
          color: billStatusColors[tc.statusTemplateId],
          label: Object.values(billStatusOptions).find(
            (option) => option.templateId === tc.statusTemplateId,
          )?.name,
          valueFormatter: (value) =>
            formatMoney(value, { maximumFractionDigits: 0 }) ?? '',
        }))}
        xAxis={[{ data: weeks, scaleType: 'band' }]}
        yAxis={[
          {
            valueFormatter: (value) =>
              formatMoney(value, { maximumFractionDigits: 0 }) ?? '',
          },
        ]}
      >
        <BarPlot />
        {chartHasData && <ChartsTooltip />}
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
        {!chartHasData && <ChartsNoDataOverlay />}
      </ResponsiveChartContainer>
    </>
  )
}
