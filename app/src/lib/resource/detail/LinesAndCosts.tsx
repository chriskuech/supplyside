import { Stack, Typography, Box, Alert, Card } from '@mui/material'
import { FieldTemplate, Resource, SchemaData } from '@supplyside/model'
import { ResourceTable } from '../table'
import ItemizedCosts from '../costs/ItemizedCosts'
import { ColumnWidths } from '../table/ResourceTable'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import { JsonLogic, readResources } from '@/client/resource'
import { FieldData } from '@/actions/types'

type Props = {
  resource: Resource
  lineSchemaData: SchemaData
  lineQuery: JsonLogic
  newLineInitialData: FieldData[]
  hideColumns?: FieldTemplate[]
  isReadOnly?: boolean
  specialColumnWidths?: ColumnWidths
}

export default async function LinesAndCosts({
  resource,
  lineSchemaData,
  lineQuery,
  newLineInitialData,
  hideColumns,
  isReadOnly,
  specialColumnWidths,
}: Props) {
  const lines = await readResources(
    resource.accountId,
    lineSchemaData.resourceType,
    { where: lineQuery },
  )

  if (!lines) return <Alert severity="error">Failed to load</Alert>

  const strippedSchemaData: SchemaData = {
    ...lineSchemaData,
    fields: lineSchemaData.fields.filter(
      ({ templateId }) =>
        !templateId || !hideColumns?.some((ft) => ft.templateId === templateId),
    ),
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="end">
        <Typography variant="h4" flexGrow={1}>
          Lines
          <Typography
            color="error"
            display="inline"
            ml={0.5}
            sx={{ verticalAlign: 'super' }}
          >
            *
          </Typography>
        </Typography>
        {!isReadOnly && (
          <CreateResourceButton
            label="Line"
            resourceType={lineSchemaData.resourceType}
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
            schemaData={strippedSchemaData}
            resources={lines}
            isEditable={!isReadOnly}
            sx={{ borderBottomRightRadius: 0 }}
            specialColumnWidths={specialColumnWidths}
            disableColumnFilter
            disableColumnResize
            disableColumnMenu
            disableColumnReorder
            hideFooter
            indexed
          />
        </Card>
        <Box alignSelf="flex-end">
          <ItemizedCosts resource={resource} isReadOnly={isReadOnly} />
        </Box>
      </Stack>
    </Stack>
  )
}
