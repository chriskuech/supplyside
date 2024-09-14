import { Stack, Typography, Box } from '@mui/material'
import { ResourceTable } from '../table'
import ItemizedCostLines from '../costs/ItemizedCostLines'
import { readSchema } from '@/domain/schema'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import { Resource } from '@/domain/resource/entity'
import { Where } from '@/domain/resource/json-logic/types'
import { ResourceFieldInput, readResources } from '@/domain/resource'
import { Schema } from '@/domain/schema/entity'
import { fields } from '@/domain/schema/template/system-fields'
import '@/server-only'

type Props = {
  resource: Resource
  lineQuery: Where
  newLineInitialData: ResourceFieldInput[]
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
          <CreateResourceButton type="Line" fields={newLineInitialData} />
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
