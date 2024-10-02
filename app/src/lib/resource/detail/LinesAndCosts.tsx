import { Stack, Typography, Box, Alert } from '@mui/material'
import { Resource, Schema, ValueInput, fields } from '@supplyside/model'
import { ResourceTable } from '../table'
import ItemizedCostLines from '../costs/ItemizedCostLines'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import { JsonLogic, readResources } from '@/client/resource'

type Props = {
  resource: Resource
  lineSchema: Schema
  lineQuery: JsonLogic
  newLineInitialData: { fieldId: string; valueInput: ValueInput }[]
  isReadOnly?: boolean
}

export default async function LinesAndCosts({
  resource,
  lineSchema,
  lineQuery,
  newLineInitialData,
  isReadOnly,
}: Props) {
  const lines = await readResources(
    resource.accountId,
    lineSchema.resourceType,
    {
      where: lineQuery,
    },
  )

  if (!lines || !lineSchema)
    return <Alert severity="error">Failed to load</Alert>

  const strippedSchema: Schema = {
    ...lineSchema,
    fields: lineSchema.fields.filter(
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
          <CreateResourceButton
            resourceType={lineSchema.resourceType}
            fields={newLineInitialData}
          />
        )}
      </Stack>
      <Stack>
        <ResourceTable
          schema={strippedSchema}
          resources={lines ?? []}
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
