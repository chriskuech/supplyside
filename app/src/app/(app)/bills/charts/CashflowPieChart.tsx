'use client'

import { PieChart, PieSeriesType } from '@mui/x-charts'
import { groupBy, sumBy } from 'remeda'
import { fields, Resource, selectResourceFieldValue } from '@supplyside/model'
import { useMemo } from 'react'
import { Typography } from '@mui/material'
import { formatMoney } from '@/lib/format'

type Props = {
  resources: Resource[]
}

export default function CashflowPieChart({ resources }: Props) {
  const data = useMemo((): PieSeriesType['data'] => {
    const resourcesGroupedByStatus = groupBy(resources, (resource) => {
      const status = selectResourceFieldValue(resource, fields.billStatus)
        ?.option?.name
      return status
    })

    return Object.entries(resourcesGroupedByStatus).map(
      ([status, resources], index) => ({
        id: index,
        value: sumBy(
          resources,
          (resource) =>
            selectResourceFieldValue(resource, fields.totalCost)?.number ?? 0,
        ),
        label: status,
      }),
    )
  }, [resources])

  const dataHasValues = useMemo(
    () => data.some((item) => item.value > 0),
    [data],
  )

  const numberOfResources = useMemo(() => resources.length, [resources])
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
