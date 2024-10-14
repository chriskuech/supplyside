import { Stack, Typography, Box, Alert, Card } from '@mui/material'
import { FieldTemplate, Resource, Schema, ValueInput } from '@supplyside/model'
import { ResourceTable } from '../table'
import ItemizedCostLines from '../costs/ItemizedCostLines'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import { JsonLogic, readResources } from '@/client/resource'

type Props = {
  resource: Resource
  lineSchema: Schema
  lineQuery: JsonLogic
  newLineInitialData: { fieldId: string; valueInput: ValueInput }[]
  hideColumns?: FieldTemplate[]
  isReadOnly?: boolean
}

export default async function LinesAndCosts({
  resource,
  lineSchema,
  lineQuery,
  newLineInitialData,
  hideColumns,
  isReadOnly,
}: Props) {
  const lines = await readResources(
    resource.accountId,
    lineSchema.resourceType,
    { where: lineQuery },
  )

  if (!lines || !lineSchema)
    return <Alert severity="error">Failed to load</Alert>

  const strippedSchema: Schema = {
    ...lineSchema,
    fields: lineSchema.fields.filter(
      ({ templateId }) =>
        !templateId || !hideColumns?.some((ft) => ft.templateId === templateId),
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
            label="Line"
            resourceType={lineSchema.resourceType}
            fields={newLineInitialData}
          />
        )}
      </Stack>
      <Stack>
        <Card
          variant="elevation"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderBottomRightRadius: 0,
          }}
        >
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
        </Card>
        <Box alignSelf="flex-end">
          <ItemizedCostLines resource={resource} isReadOnly={isReadOnly} />
        </Box>
      </Stack>
    </Stack>
  )
}
