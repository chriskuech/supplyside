'use client'

import { fail } from 'assert'
import {
  BarPlot,
  ChartsReferenceLine,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  LinePlot,
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
  getNextResourceCreationDate,
  jobStatusOptions,
  Resource,
  selectResourceFieldValue,
} from '@supplyside/model'
import dayjs, { Dayjs } from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isBetween from 'dayjs/plugin/isBetween'
import { useMemo } from 'react'
import { Typography } from '@mui/material'
import { blue, green, grey, red } from '@mui/material/colors'
import { formatMoney } from '@/lib/format'
import { billStatusOrder, jobStatusOrder } from '@/lib/constants/status'
import { CASHFLOW_WEEKS } from '@/lib/constants/charts'

dayjs.extend(weekOfYear)
dayjs.extend(isBetween)

type Props = {
  jobs: Resource[]
  bills: Resource[]
  recurringBills: Resource[]
}

export default function NetCashflowChart({
  jobs,
  bills,
  recurringBills,
}: Props) {
  const weekStart = dayjs(new Date()).day(1)

  const weeks = useMemo(
    (): string[] =>
      range(0, CASHFLOW_WEEKS).map((number) =>
        weekStart.week(weekStart.week() + number).format('MM/DD/YYYY'),
      ),
    [weekStart],
  )

  const jobsTotalCosts = useMemo(() => {
    const totalcostsByWeek = pipe(
      jobs,
      map((resource) => {
        const paymentDueDate = selectResourceFieldValue(
          resource,
          fields.paymentDueDate,
        )?.date
        const totalCost =
          selectResourceFieldValue(resource, fields.totalCost)?.number ?? 0

        if (!paymentDueDate) return null

        return {
          paymentDueDate: dayjs(paymentDueDate).day(1),
          totalCost,
        }
      }),
      filter(isTruthy),
      filter((r) => r.paymentDueDate.isAfter(weekStart)),
      map(({ paymentDueDate, totalCost }) => ({
        week: weeks.find((week, i) => {
          const weekDate = dayjs(week)
          if (!weeks[i + 1]) return true
          const nextWeekDate = dayjs(weeks[i + 1])
          return paymentDueDate.isBetween(weekDate, nextWeekDate)
        }),
        totalCost,
      })),
      groupBy(({ week }) => week),
      mapValues(sumBy(({ totalCost }) => totalCost)),
    )

    return weeks.map((week) => totalcostsByWeek[week] ?? 0)
  }, [weeks, jobs, weekStart])

  const billsTotalCosts = useMemo(() => {
    const totalcostsByWeek = pipe(
      bills,
      map((resource) => {
        const paymentDueDate = selectResourceFieldValue(
          resource,
          fields.paymentDueDate,
        )?.date
        const totalCost =
          selectResourceFieldValue(resource, fields.totalCost)?.number ?? 0

        if (!paymentDueDate) return null

        return {
          paymentDueDate: dayjs(paymentDueDate).day(1),
          totalCost,
        }
      }),
      filter(isTruthy),
      filter((r) => r.paymentDueDate.isAfter(weekStart)),
      map(({ paymentDueDate, totalCost }) => ({
        week: weeks.find((week, i) => {
          const weekDate = dayjs(week)
          if (!weeks[i + 1]) return true
          const nextWeekDate = dayjs(weeks[i + 1])
          return paymentDueDate.isBetween(weekDate, nextWeekDate)
        }),
        totalCost,
      })),
      groupBy(({ week }) => week),
      mapValues(sumBy(({ totalCost }) => totalCost)),
    )

    return weeks.map((week) => totalcostsByWeek[week] ?? 0)
  }, [weeks, bills, weekStart])

  const extrapolatedRecurrentBills: {
    creationDate: Dayjs
    totalCosts: number
  }[] = useMemo(
    () =>
      recurringBills.flatMap((recurringResource) => {
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
    [recurringBills, weeks],
  )

  const currentWeek = useMemo(
    () => weeks.find((week) => weekStart.isSame(dayjs(week), 'd')),
    [weekStart, weeks],
  )

  const overdueJobsTotal = useMemo(
    () =>
      pipe(
        jobs,
        filter((r) => {
          const paymentDueDate = selectResourceFieldValue(
            r,
            fields.paymentDueDate,
          )?.date

          const jobStatusTemplateId = selectResourceFieldValue(
            r,
            fields.jobStatus,
          )?.option?.templateId

          const statusOrder =
            jobStatusTemplateId && jobStatusOrder[jobStatusTemplateId]

          const jobIsNotPaid =
            !!statusOrder &&
            statusOrder <
              (jobStatusOrder[jobStatusOptions.paid.templateId] ??
                fail('job status paid order not found'))

          return (
            !!paymentDueDate &&
            jobIsNotPaid &&
            dayjs(paymentDueDate).isBefore(weekStart)
          )
        }),
        sumBy(
          (r) => selectResourceFieldValue(r, fields.totalCost)?.number ?? 0,
        ),
      ),
    [jobs, weekStart],
  )

  const overdueBillsTotal = useMemo(
    () =>
      pipe(
        bills,
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
    [bills, weekStart],
  )

  const recurringBillsTotalCosts = useMemo(
    () =>
      weeks.map((date) => {
        const total = pipe(
          extrapolatedRecurrentBills,
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
    [extrapolatedRecurrentBills, weeks],
  )

  const netTotals = useMemo(
    () =>
      weeks.map((_, index) => {
        const jobsTotal = jobsTotalCosts[index] ?? 0
        const billsTotal = billsTotalCosts[index] ?? 0
        const recurringBillsTotal = recurringBillsTotalCosts[index] ?? 0

        return jobsTotal - billsTotal - recurringBillsTotal
      }),
    [jobsTotalCosts, billsTotalCosts, recurringBillsTotalCosts, weeks],
  )

  // Hack to hide the items on the tooltip that do not have a value
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const valueFormatter = (value: number | null): any =>
    formatMoney(value, { maximumFractionDigits: 0 }) ?? null

  return (
    <>
      <Typography variant="h6">Weekly Net Cashflow</Typography>
      <ResponsiveChartContainer
        sx={{ padding: 1, marginLeft: 2, overflow: 'visible' }}
        series={[
          {
            type: 'bar' as const,
            stack: 'unique',
            data: [null, ...jobsTotalCosts],
            color: green[300],
            label: 'Jobs',
            valueFormatter: valueFormatter,
          },
          {
            type: 'bar' as const,
            stack: 'unique',
            data: [
              null,
              ...billsTotalCosts.map((cost) => (cost ? cost * -1 : null)),
            ],
            color: blue[300],
            label: 'Bills',
            valueFormatter: valueFormatter,
          },
          {
            type: 'bar' as const,
            stack: 'unique',
            data: [
              null,
              ...recurringBillsTotalCosts.map((cost) =>
                cost ? cost * -1 : null,
              ),
            ],
            color: grey[300],
            label: 'Recurring Bills',
            valueFormatter: valueFormatter,
          },
          {
            type: 'bar',
            stack: 'unique',
            label: 'Jobs',
            color: red[100],
            data: [overdueJobsTotal],
            valueFormatter: valueFormatter,
          },
          {
            type: 'bar',
            stack: 'unique',
            label: 'Bills',
            color: red[200],
            data: [overdueBillsTotal * -1],
            valueFormatter: valueFormatter,
          },
          {
            type: 'line',
            data: [overdueJobsTotal - overdueBillsTotal, ...netTotals],
            color: green[700],
            label: 'Net Total',
            valueFormatter: valueFormatter,
          },
        ]}
        xAxis={[
          {
            data: ['overdue', ...weeks.map((w) => dayjs(w).format('MM/DD'))],
            scaleType: 'band',
          },
        ]}
        yAxis={[
          {
            valueFormatter: valueFormatter,
          },
        ]}
      >
        <BarPlot />
        <LinePlot />
        <ChartsTooltip />
        <ChartsXAxis />
        <ChartsYAxis />
        {currentWeek && (
          <ChartsReferenceLine
            x={dayjs(currentWeek).format('MM/DD')}
            lineStyle={{ stroke: 'red' }}
            labelStyle={{ fontSize: '12', stroke: 'red' }}
            label="today"
            labelAlign="start"
          />
        )}
        <ChartsReferenceLine y={0} lineStyle={{ stroke: 'gray' }} />
      </ResponsiveChartContainer>
    </>
  )
}
