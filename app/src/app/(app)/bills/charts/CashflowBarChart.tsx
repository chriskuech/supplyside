'use client'

import { fail } from 'assert'
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
  sortBy,
} from 'remeda'
import {
  billStatusOptions,
  fields,
  getNextResourceCreationDate,
  Resource,
  selectResourceFieldValue,
} from '@supplyside/model'
import dayjs, { Dayjs } from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isBetween from 'dayjs/plugin/isBetween'
import { useMemo } from 'react'
import { ChartsNoDataOverlay } from '@mui/x-charts/ChartsOverlay'
import { Typography } from '@mui/material'
import { grey, red } from '@mui/material/colors'
import { formatMoney } from '@/lib/format'
import { billStatusOrder } from '@/lib/constants/status'
import { CASHFLOW_WEEKS } from '@/lib/constants/charts'

dayjs.extend(weekOfYear)
dayjs.extend(isBetween)

type Props = {
  resources: Resource[]
  recurringResources: Resource[]
}

export default function CashflowBarChart({
  resources,
  recurringResources,
}: Props) {
  const weekStart = dayjs(new Date()).day(1)

  const weeks = useMemo(
    (): string[] =>
      range(0, CASHFLOW_WEEKS).map((number) =>
        weekStart.week(weekStart.week() + number).format('MM/DD/YYYY'),
      ),
    [weekStart],
  )

  const extrapolatedResources: { creationDate: Dayjs; totalCosts: number }[] =
    useMemo(
      () =>
        recurringResources.flatMap((recurringResource) => {
          const totalCost = selectResourceFieldValue(
            recurringResource,
            fields.totalCost,
          )?.number

          let nextCreationDate = getNextResourceCreationDate(recurringResource)

          const finalDate = weeks[weeks.length - 1]
          const resources = []
          while (
            nextCreationDate &&
            finalDate &&
            nextCreationDate.isBefore(finalDate)
          ) {
            resources.push({
              creationDate: nextCreationDate,
              totalCosts: totalCost ?? 0,
            })

            nextCreationDate = getNextResourceCreationDate(
              recurringResource,
              nextCreationDate,
            )
          }

          return resources
        }),
      [recurringResources, weeks],
    )

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
      filter((r) => r.paymentDueDate.isAfter(weekStart)),
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

    const totalsByStatuses = pipe(
      Object.entries(totalCostByStatusAndWeeks),
      map(([key, value]) => ({
        statusTemplateId: key,
        totalsByWeek: weeks.map((week) => value[week] ?? 0),
      })),
      sortBy(({ statusTemplateId }) => billStatusOrder[statusTemplateId] ?? 0),
    )

    return totalsByStatuses
  }, [weeks, resources, weekStart])

  const currentWeek = useMemo(
    () => weeks.find((week) => weekStart.isSame(dayjs(week), 'd')),
    [weekStart, weeks],
  )

  const totalRecurringCosts = useMemo(
    () =>
      weeks.map((date) => {
        const total = pipe(
          extrapolatedResources,
          filter((resource) =>
            resource.creationDate.isBetween(
              dayjs(date),
              dayjs(date).add(7, 'days'),
            ),
          ),
          sumBy((resource) => resource.totalCosts),
        )

        return total
      }),
    [extrapolatedResources, weeks],
  )

  const overdueBillsTotal = useMemo(
    () =>
      pipe(
        resources,
        filter((r) => {
          const paymentDueDate = selectResourceFieldValue(
            r,
            fields.paymentDueDate,
          )?.date

          const billStatusTemplateId = selectResourceFieldValue(
            r,
            fields.billStatus,
          )?.option?.templateId

          const statusOrder =
            billStatusTemplateId && billStatusOrder[billStatusTemplateId]

          const billIsNotPaid =
            !!statusOrder &&
            statusOrder <
              (billStatusOrder[billStatusOptions.paid.templateId] ??
                fail('Bill status paid order not found'))

          return (
            !!paymentDueDate &&
            billIsNotPaid &&
            dayjs(paymentDueDate).isBefore(weekStart)
          )
        }),
        sumBy(
          (r) => selectResourceFieldValue(r, fields.totalCost)?.number ?? 0,
        ),
      ),
    [resources, weekStart],
  )

  const chartHasData = !!totalCosts.length

  return (
    <>
      <Typography variant="h6">Weekly Cashflow</Typography>
      <ResponsiveChartContainer
        sx={{ padding: 1, marginLeft: 2, overflow: 'visible' }}
        series={[
          ...totalCosts.map((tc) => ({
            type: 'bar' as const,
            stack: 'unique',
            data: [null, ...tc.totalsByWeek],
            color: Object.values(billStatusOptions).find(
              (option) => option.templateId === tc.statusTemplateId,
            )?.color,
            label: Object.values(billStatusOptions).find(
              (option) => option.templateId === tc.statusTemplateId,
            )?.name,
            valueFormatter: (value: number | null) =>
              formatMoney(value, { maximumFractionDigits: 0 }) ?? '-',
          })),
          {
            type: 'bar',
            stack: 'unique',
            label: 'Recurring Bills',
            data: [null, ...totalRecurringCosts],
            color: grey[300],
            valueFormatter: (value) =>
              formatMoney(value, { maximumFractionDigits: 0 }) ?? '-',
          },
          {
            type: 'bar',
            stack: 'unique',
            label: 'overdue',
            color: red[200],
            data: [overdueBillsTotal],
            valueFormatter: (value: number | null) =>
              formatMoney(value, { maximumFractionDigits: 0 }) ?? '-',
          },
        ]}
        xAxis={[
          {
            data: ['overdue', ...weeks.map((w) => dayjs(w).format('MM/YY'))],
            scaleType: 'band',
          },
        ]}
        yAxis={[
          {
            valueFormatter: (value) =>
              formatMoney(value, { maximumFractionDigits: 0 }) ?? '-',
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
