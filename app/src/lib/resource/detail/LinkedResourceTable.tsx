import { fail } from 'assert'
import { Stack, Typography } from '@mui/material'
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
  sectionTitle: string
  resourceType: ResourceType
  backlinkField: FieldTemplate
}

export default async function LinkedResourceTable({
  resourceId,
  resourceType,
  sectionTitle,
  backlinkField,
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
    <>
      <Stack direction="row" alignItems="end">
        <Typography variant="h4" flexGrow={1}>
          {sectionTitle}
        </Typography>
        <CreateResourceButton
          resourceType="Purchase"
          fields={[{ fieldId: backlinkFieldId, valueInput: { resourceId } }]}
        />
      </Stack>
      <ResourceTable
        schema={linkedResourceSchema}
        resources={linkedResources ?? []}
        isEditable={false}
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
    </>
  )
}
