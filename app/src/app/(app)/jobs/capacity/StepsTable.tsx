'use client'

import { DataGridPro } from '@mui/x-data-grid-pro'
import { ValueResource, fields } from '@supplyside/model'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { updateResource } from '@/actions/resource'

dayjs.extend(utc)

type Row = {
  id: string
  ready: boolean | null
  completed: boolean | null
  partName: string | null
  quantity: number | null
  hours: number | null
  startDate: string | null
  deliveryDate: string | null
  needDate: string | null
  job: ValueResource | null
}

type Props = {
  rows: Row[]
}

export const StepsTable = ({ rows }: Props) => {
  const router = useRouter()

  return (
    <DataGridPro<Row>
      columns={[
        {
          field: 'ready',
          headerName: 'Ready?',
          description: 'All prior steps completed',
          type: 'boolean',
        },
        {
          field: 'completed',
          headerName: 'Completed?',
          type: 'boolean',
          editable: true,
        },
        {
          field: 'partName',
          headerName: 'Part Name',
          flex: 1,
          type: 'string',
        },
        {
          field: 'quantity',
          headerName: 'Quantity',
          type: 'number',
        },
        {
          field: 'hours',
          headerName: 'Hours',
          type: 'number',
        },
        {
          field: 'startDate',
          headerName: 'Start Date',
          type: 'string',
          valueGetter: (e, { startDate }) =>
            startDate ? dayjs(startDate).utc().format('MM/DD/YYYY') : null,
        },
        {
          field: 'deliveryDate',
          headerName: 'Delivery Date',
          type: 'string',
          valueGetter: (e, { deliveryDate }) =>
            deliveryDate
              ? dayjs(deliveryDate).utc().format('MM/DD/YYYY')
              : null,
        },
      ]}
      rows={rows}
      onCellClick={({ isEditable, row }) => {
        !isEditable && router.push(`/jobs/${row.job?.key}`)
      }}
      rowSelection={false}
      disableRowSelectionOnClick
      editMode="cell"
      processRowUpdate={(row) =>
        updateResource(row.id, [
          {
            field: fields.completed,
            valueInput: {
              boolean: !!row.completed,
            },
          },
        ]).then(() => row)
      }
    />
  )
}
