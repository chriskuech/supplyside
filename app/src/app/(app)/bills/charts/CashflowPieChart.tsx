'use client'

import { PieChart, PieSeriesType } from '@mui/x-charts'
import { groupBy, sumBy, pipe, entries, map, sortBy } from 'remeda'
import {
  billStatusOptions,
  fields,
  Resource,
  selectResourceFieldValue,
} from '@supplyside/model'
import { useMemo } from 'react'
import { Typography } from '@mui/material'
import { formatMoney } from '@/lib/format'
import { billStatusOrder } from '@/lib/constants/status'

type Props = {
  resources: Resource[]
}

export default function CashflowPieChart({ resources }: Props) {
  const data = useMemo(
    (): PieSeriesType['data'] =>
      pipe(
        resources,
        groupBy(
          (resource) =>
            selectResourceFieldValue(resource, fields.billStatus)?.option
              ?.templateId ?? '',
        ),
        entries(),
        sortBy(([statusTemplateId]) => billStatusOrder[statusTemplateId] ?? 0),
        map(([statusTemplateId, resources], index) => ({
          id: index,
          value: sumBy(
            resources,
            (resource) =>
              selectResourceFieldValue(resource, fields.totalCost)?.number ?? 0,
          ),
          label: Object.values(billStatusOptions).find(
            (option) => option.templateId === statusTemplateId,
          )?.name,
          color: Object.values(billStatusOptions).find(
            (option) => option.templateId === statusTemplateId,
          )?.color,
        })),
      ),
    [resources],
  )

  const dataHasValues = useMemo(
    () => data.some((item) => item.value > 0),
    [data],
  )

  const numberOfResources = resources.length
  const total = useMemo(() => sumBy(data, (item) => item.value), [data])

  return (
    <>
      <Typography variant="h6">
        {dataHasValues
          ? `${numberOfResources} Bills (${formatMoney(total, { maximumFractionDigits: 0 })})`
          : 'Bills'}
      </Typography>
      <PieChart
        height={200}
        sx={{ padding: 1, overflow: 'visible', mr: 1 }}
        series={[
          {
            data: dataHasValues ? data : [],
            valueFormatter: (item) =>
              formatMoney(item.value, { maximumFractionDigits: 0 }) ?? '',
          },
        ]}
        slotProps={{
          legend: {
            itemMarkHeight: 12,
          },
        }}
      />
    </>
  )
}
