import { fail } from 'assert'
import { Card, Stack, Typography } from '@mui/material'
import {
  FieldTemplate,
  ResourceType,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { ResourceTable } from '../table'
import CreateResourceButton from '../CreateResourceButton'
import { readResources } from '@/actions/resource'
import { readSchema } from '@/actions/schema'

export type LinkedResourceTableProps = {
  resourceId: string
  sectionTitle?: string
  resourceType: ResourceType
  backlinkField: FieldTemplate
  disableCreate?: boolean
}

export default async function LinkedResourceTable({
  resourceId,
  resourceType,
  sectionTitle,
  backlinkField,
  disableCreate,
}: LinkedResourceTableProps) {
  const linkedResources = await readResources(resourceType, {
    where: {
      '==': [{ var: backlinkField.name }, resourceId],
    },
  })
  const linkedResourceSchema =
    (await readSchema(resourceType)) ??
    fail(`Cannot read ${resourceType} schema`)

  const backlinkFieldId = selectSchemaFieldUnsafe(
    linkedResourceSchema,
    backlinkField,
  ).fieldId

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="end">
        <Typography variant="h4" flexGrow={1}>
          {sectionTitle ??
            resourceType.replace(/([a-z])([A-Z])/g, '$1 $2') + 's'}
        </Typography>
        {!disableCreate && (
          <CreateResourceButton
            resourceType={resourceType}
            fields={[{ fieldId: backlinkFieldId, valueInput: { resourceId } }]}
          />
        )}
      </Stack>
      <Card
        variant="elevation"
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderBottomRightRadius: 0,
        }}
      >
        <ResourceTable
          tableKey="job-purchases"
          schema={linkedResourceSchema}
          resources={linkedResources ?? []}
          isEditable={false}
          sx={{
            borderBottomRightRadius: 0,
          }}
          disableColumnFilter
          disableColumnMenu
          hideFooter
          indexed
        />
      </Card>
    </Stack>
  )
}
