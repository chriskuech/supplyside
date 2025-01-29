import { fields } from '@supplyside/model'
import { Card, Stack, Typography } from '@mui/material'
import { ResourceTable } from '../resource/table'
import CreateResourceButton from '../resource/CreateResourceButton'
import { requireSession } from '@/session'
import { readResources } from '@/client/resource'
import { readSchema } from '@/client/schema'

type WorkCenterOperationsProps = {
  workCenterId: string
}

export const WorkCenterOperations: React.FC<
  WorkCenterOperationsProps
> = async ({ workCenterId }) => {
  const { accountId } = await requireSession()
  const operationSchema = await readSchema(accountId, 'Operation')
  const operations = await readResources(accountId, 'Operation', {
    where: {
      '==': [{ var: fields.workCenter.name }, workCenterId],
    },
  })

  if (!operations || !operationSchema) return null

  return (
    <Stack width="100%" spacing={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Operations</Typography>
        <CreateResourceButton
          resourceType="Operation"
          buttonProps={{ size: 'small' }}
          fields={[
            {
              field: fields.workCenter,
              valueInput: { resourceId: workCenterId },
            },
            {
              field: fields.sequenceNumber,
              valueInput: { number: operations.length + 1 },
            },
          ]}
        />
      </Stack>

      <Card
        variant="elevation"
        sx={{ borderColor: 'divider', borderWidth: 1, borderStyle: 'solid' }}
      >
        <ResourceTable
          tableKey="workCenterOperations"
          schemaData={operationSchema}
          resources={operations}
          isEditable
          slots={{}} // hide the toolbar
          disableColumnFilter
          disableColumnMenu
          hideId
          hideFields={[
            fields.completed,
            fields.dateCompleted,
            fields.operator,
            fields.workCenter,
            fields.otherNotes,
            fields.step,
          ]}
        />
      </Card>
    </Stack>
  )
}
