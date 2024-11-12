'use client'

import { DataGridPro } from '@mui/x-data-grid-pro'
import { ValueResource, fields } from '@supplyside/model'
import { useRouter } from 'next/navigation'
import { updateResource } from '@/actions/resource'

type Row = {
  id: string
  ready: boolean | null
  completed: boolean | null
  partName: string | null
  hours: number | null
  startDate: Date | null
  deliveryDate: Date | null
  needDate: Date | null
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
          field: 'hours',
          headerName: 'Hours',
          type: 'number',
        },
        {
          field: 'startDate',
          headerName: 'Start Date',
          type: 'date',
        },
        {
          field: 'deliveryDate',
          headerName: 'Delivery Date',
          type: 'date',
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
