import { Stack, Typography, Box } from '@mui/material'
import { ResourceTable } from '../table'
import ItemizedCostLines from '../costs/ItemizedCostLines'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import { Resource } from '@/domain/resource/entity'
import { Where } from '@/domain/resource/json-logic/types'
import {
  ResourceFieldInput,
  ResourceService,
} from '@/domain/resource/ResourceService'
import { Schema } from '@/domain/schema/entity'
import { fields } from '@/domain/schema/template/system-fields'
import { SchemaService } from '@/domain/schema/SchemaService'
import { container } from '@/lib/di'

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
  const schemaService = container().resolve(SchemaService)

  const [lines, lineSchema] = await Promise.all([
    container().resolve(ResourceService).readResources({
      accountId: resource.accountId,
      type: 'Line',
      where: lineQuery,
    }),
    schemaService.readSchema(resource.accountId, 'Line'),
  ])

  const strippedSchema: Schema = {
    ...lineSchema,
    allFields: lineSchema.allFields.filter(
      ({ templateId }) =>
        !templateId ||
        ![fields.purchase.templateId, fields.bill.templateId].includes(
          templateId,
        ),
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
