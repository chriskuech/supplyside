import { Box, Container, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { match } from 'ts-pattern'
import {
  FieldTemplate,
  Resource,
  Schema,
  fields,
  selectResourceFieldValue,
  selectSchemaField,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import ResourceForm from '../ResourceForm'
import { ResourceDrawer } from '../ResourceDrawer'
import DeleteResourceButton from '../DeleteResourceButton'
import { CompareModal } from '../CompareModal'
import FieldControl from '../fields/FieldControl'
import ReadOnlyFieldsView from './ReadOnlyFieldsView'
import LinesAndCosts from './LinesAndCosts'
import DuplicateResourceButton from './DuplicateResourceButton'
import HandleJustCloned from './HandleJustCloned'
import LinkedResourceTable, {
  LinkedResourceTableProps,
} from './LinkedResourceTable'
import BreadcrumbFrame from './Breadcrumb'

type Props = {
  schema: Schema
  lineSchema?: Schema
  resource: Resource
  tools: (fontSize: 'small' | 'medium' | 'large') => readonly ReactNode[]
  isReadOnly?: boolean
  linesBacklinkField?: FieldTemplate
  actions?: ReactNode
  searchParams: Record<string, unknown>
  linkedResources?: Omit<LinkedResourceTableProps, 'resourceId'>[]
  path: { label: string; href: string }[]
  status?: {
    color: 'inactive' | 'active' | 'success' | 'error'
    label: string
  }
}

export default function ResourceDetailPage({
  schema,
  lineSchema,
  resource,
  tools: customTools,
  linesBacklinkField,
  isReadOnly,
  actions,
  searchParams,
  linkedResources,
  path,
  status,
}: Props) {
  const tools = (fontSize: 'small' | 'medium' | 'large') => [
    ...customTools(fontSize),
    resource.type !== 'Vendor' && (
      <DuplicateResourceButton
        key={DuplicateResourceButton.name}
        resourceId={resource.id}
        resourceType={resource.type}
        fontSize={fontSize}
      />
    ),
    !resource.templateId && (
      <DeleteResourceButton
        key={DeleteResourceButton.name}
        resourceType={resource.type}
        resourceId={resource.id}
        size={fontSize}
      />
    ),
  ]

  const nameField = selectSchemaField(schema, fields.name)
  const nameValue = selectResourceFieldValue(resource, fields.name)

  return (
    <>
      <BreadcrumbFrame
        path={path}
        tools={tools('small')}
        status={status}
        name={nameValue?.string ?? undefined}
      />
      <Stack>
        <HandleJustCloned />
        <Container sx={{ py: 5 }}>
          {nameField && (
            <Stack direction="row" alignItems="center">
              <Typography variant="overline">
                {resource.type.replace(/([a-z])([A-Z])/g, '$1 $2')} #
                {resource.key}
              </Typography>
            </Stack>
          )}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h3">
              {nameField ? (
                <Box width={600}>
                  <FieldControl
                    value={nameValue}
                    resourceId={resource.id}
                    inputId="nameField"
                    field={nameField}
                    inputProps={{
                      placeholder: 'Job Name',
                      sx: { fontSize: '0.7em' },
                    }}
                  />
                </Box>
              ) : (
                <>
                  <span style={{ opacity: 0.5 }}>
                    {resource.type.replace(/([a-z])([A-Z])/g, '$1 $2')} #
                  </span>
                  <span>{resource.key}</span>
                </>
              )}
            </Typography>

            <Box flexGrow={1} />

            {tools('large').map((tool, i) => (
              <Box height="min-content" key={i}>
                {tool}
              </Box>
            ))}
          </Stack>
        </Container>

        {actions}

        <Container sx={{ py: 5 }}>
          <Stack spacing={5}>
            {isReadOnly ? (
              <ReadOnlyFieldsView schema={schema} resource={resource} />
            ) : (
              <ResourceForm schema={schema} resource={resource} />
            )}
            {linesBacklinkField && lineSchema && (
              <LinesAndCosts
                lineSchema={lineSchema}
                resource={resource}
                lineQuery={{
                  '==': [{ var: linesBacklinkField.name }, resource.id],
                }}
                newLineInitialData={[
                  {
                    fieldId: selectSchemaFieldUnsafe(
                      lineSchema,
                      linesBacklinkField,
                    ).fieldId,
                    valueInput: { resourceId: resource.id },
                  },
                ]}
                hideColumns={match(schema.resourceType)
                  .with('Bill', () => [fields.bill])
                  .with('Job', () => [fields.job])
                  .with('Purchase', () => [fields.purchase])
                  .otherwise(() => undefined)}
                isReadOnly={isReadOnly}
              />
            )}
            {linkedResources?.map((linkedResource) => (
              <LinkedResourceTable
                key={linkedResource.resourceType}
                resourceId={resource.id}
                {...linkedResource}
              />
            ))}
          </Stack>
        </Container>
      </Stack>
      <ResourceDrawer searchParams={searchParams} />
      <CompareModal
        resource={resource}
        schema={schema}
        searchParams={searchParams}
      />
    </>
  )
}
