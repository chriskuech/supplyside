import { Box, Container, Divider, Stack, Typography } from '@mui/material'
import { PropsWithChildren, ReactNode } from 'react'
import { match } from 'ts-pattern'
import {
  FieldTemplate,
  Option,
  OptionTemplate,
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
import { ColumnWidths } from '../table/ResourceTable'
import ReadOnlyFieldsView from './ReadOnlyFieldsView'
import LinesAndCosts from './LinesAndCosts'
import DuplicateResourceButton from './DuplicateResourceButton'
import HandleJustCloned from './HandleJustCloned'
import LinkedResourceTable, {
  LinkedResourceTableProps,
} from './LinkedResourceTable'
import BreadcrumbFrame from './Breadcrumb'
import CancelResourceButton from './CancelResourceButton'
import EditResourceControl from './EditResourceButton'

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
    statusFieldTemplate: FieldTemplate
    draftStatusOptionTemplate: OptionTemplate
    cancelStatusOptionTemplate: OptionTemplate
    currentStatus: Option
  }
  specialColumnWidths?: ColumnWidths
  header?: ReactNode
  customerName?: string
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
  specialColumnWidths,
  children,
  header,
  customerName,
}: PropsWithChildren<Props>) {
  const baseTools = (fontSize: 'small' | 'medium' | 'large') => (
    <>
      {resource.type !== 'Vendor' && (
        <DuplicateResourceButton
          key={DuplicateResourceButton.name}
          resourceId={resource.id}
          resourceType={resource.type}
          fontSize={fontSize}
        />
      )}
      {status && (
        <>
          <EditResourceControl
            fontSize={fontSize}
            draftStatusOptionTemplate={status.draftStatusOptionTemplate}
            statusFieldTemplate={status.statusFieldTemplate}
            resourceId={resource.id}
          />
          <CancelResourceButton
            resourceId={resource.id}
            fontSize={fontSize}
            statusFieldTemplate={status.statusFieldTemplate}
            cancelStatusOptionTemplate={status.cancelStatusOptionTemplate}
          />
        </>
      )}
      {!resource.templateId && (
        <DeleteResourceButton
          key={DeleteResourceButton.name}
          resourceType={resource.type}
          resourceId={resource.id}
          size={fontSize}
        />
      )}
    </>
  )

  const tools = (fontSize: 'small' | 'medium' | 'large') => (
    <>
      {customTools(fontSize)}
      <Divider key={Divider.name} orientation="vertical" flexItem />
      {baseTools(fontSize)}
    </>
  )

  const nameField = selectSchemaField(schema, fields.name)
  const nameValue = selectResourceFieldValue(resource, fields.name)

  return (
    <>
      <BreadcrumbFrame
        path={path}
        tools={tools('small')}
        status={status?.currentStatus}
        name={nameValue?.string ?? undefined}
        customerName={customerName}
      />
      <Stack>
        <HandleJustCloned />
        <Container sx={{ py: 5 }}>
          <Box>
            <Stack direction="row" alignItems="center">
              <Typography variant="overline">
                {resource.type.replace(/([a-z])([A-Z])/g, '$1 $2')} #
                {resource.key}
                {customerName && (
                  <>
                    {' '}
                    <Typography fontSize={17} color="divider" display="inline">
                      •
                    </Typography>
                    {customerName}
                  </>
                )}
              </Typography>
              <Box flexGrow={1} />
              {baseTools('small')}
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h3">
                {nameField ? (
                  <Box width={600}>
                    <FieldControl
                      resource={resource}
                      inputId="nameField"
                      field={nameField}
                      inputProps={{
                        placeholder:
                          resource.type.replace(/([a-z])([A-Z])/g, '$1 $2') +
                          ' Name',
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

              {customTools('large').map((tool, i) => (
                <Box height="min-content" key={i}>
                  {tool}
                </Box>
              ))}
            </Stack>
            {header && (
              <Stack mt={1} direction="row" alignItems="start" spacing={1}>
                {header}
              </Stack>
            )}
          </Box>
        </Container>

        {actions}

        <Container sx={{ py: 5 }}>
          <Stack spacing={5}>
            {isReadOnly ? (
              <ReadOnlyFieldsView schema={schema} resource={resource} />
            ) : (
              <ResourceForm schema={schema} resource={resource} />
            )}
            {children}
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
                specialColumnWidths={specialColumnWidths}
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
