'use client'

import { PieChart, PieSeriesType } from '@mui/x-charts'
import { groupBy, sumBy } from 'remeda'
import { fields, Resource, selectResourceFieldValue } from '@supplyside/model'
import { useMemo } from 'react'
import { formatMoney } from '@/lib/format'

type Props = {
  resources: Resource[]
}

export default function CashflowPieChart({ resources }: Props) {
  const data = useMemo((): PieSeriesType['data'] => {
    const resourcesGroupedByStatus = groupBy(resources, (resource) => {
      const status = selectResourceFieldValue(resource, fields.jobStatus)
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

  return (
    <PieChart
      sx={{ padding: 1 }}
      series={[
        {
          data: data,
          valueFormatter: (item) => formatMoney(item.value) ?? '',
        },
      ]}
    />
  )
}
