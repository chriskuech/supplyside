import { Stack, Typography, Box } from '@mui/material'
import { ResourceTable } from '../table'
import ItemizedCostLines from './ItemizedCostLines'
import { readSchema } from '@/domain/schema/actions'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import { Data, Resource } from '@/domain/resource/types'
import { Where } from '@/domain/resource/json-logic/types'
import { readResources } from '@/domain/resource/actions'
import { Schema } from '@/domain/schema/types'
import { fields } from '@/domain/schema/template/system-fields'

type Props = {
  resource: Resource
  lineQuery: Where
  newLineInitialData: Data
  isReadOnly?: boolean
}

export default async function LinesAndCosts({
  resource,
  lineQuery,
  newLineInitialData,
  isReadOnly,
}: Props) {
  const [lines, lineSchema] = await Promise.all([
    readResources({
      accountId: resource.accountId,
      type: 'Line',
      where: lineQuery,
    }),
    readSchema({
      accountId: resource.accountId,
      resourceType: 'Line',
    }),
  ])

  const strippedSchema: Schema = {
    ...lineSchema,
    allFields: lineSchema.allFields.filter(
      ({ templateId }) =>
        !templateId ||
        ![fields.order.templateId, fields.bill.templateId].includes(templateId),
    ),
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="end">
        <Typography variant="h4" flexGrow={1}>
          Lines
        </Typography>
        {!isReadOnly && (
          <CreateResourceButton type="Line" data={newLineInitialData} />
        )}
      </Stack>
      <Stack>
        <ResourceTable
          schema={strippedSchema}
          resources={lines}
          isEditable={!isReadOnly}
          sx={{
            borderBottomRightRadius: 0,
          }}
          disableColumnFilter
          disableColumnResize
          disableColumnMenu
          disableColumnReorder
          hideFooter
          indexed
        />
        <Box alignSelf="flex-end">
          <ItemizedCostLines resource={resource} isReadOnly={isReadOnly} />
        </Box>
      </Stack>
    </Stack>
  )
}
