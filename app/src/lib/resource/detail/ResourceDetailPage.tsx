import { Box, Container, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { match, P } from 'ts-pattern'
import {
  FieldTemplate,
  Resource,
  Schema,
  fields,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import ResourceForm from '../ResourceForm'
import { ResourceDrawer } from '../ResourceDrawer'
import DeleteResourceButton from '../DeleteResourceButton'
import { CompareModal } from '../CompareModal'
import ReadOnlyFieldsView from './ReadOnlyFieldsView'
import LinesAndCosts from './LinesAndCosts'
import DuplicateResourceButton from './DuplicateResourceButton'
import HandleJustCloned from './HandleJustCloned'

type Props = {
  schema: Schema
  lineSchema: Schema | null
  resource: Resource
  name?: string | null
  tools: readonly ReactNode[]
  isReadOnly?: boolean
  backlinkField?: FieldTemplate
  actions?: ReactNode
  searchParams: Record<string, unknown>
}

export default function ResourceDetailPage({
  schema,
  lineSchema,
  resource,
  name,
  tools,
  backlinkField,
  isReadOnly,
  actions,
  searchParams,
}: Props) {
  return (
    <>
      <Stack>
        <HandleJustCloned />
        <Container sx={{ py: 5 }}>
          {name && (
            <Stack direction="row" alignItems="center">
              <Typography variant="overline">
                {resource.type} #{resource.key}
              </Typography>
            </Stack>
          )}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h3">
              {match(name)
                .with(P.string, () => <>{name}</>)
                .with(null, () => <span style={{ opacity: 0.5 }}>No Name</span>)
                .with(undefined, () => (
                  <>
                    <span style={{ opacity: 0.5 }}>{resource.type} #</span>
                    <span>{resource.key}</span>
                  </>
                ))
                .exhaustive()}
            </Typography>

            <Box flexGrow={1} />

            {[
              ...tools,
              resource.type !== 'Vendor' && (
                <DuplicateResourceButton
                  key={DuplicateResourceButton.name}
                  resourceId={resource.id}
                  resourceType={resource.type}
                />
              ),
              !resource.templateId && (
                <DeleteResourceButton
                  key={DeleteResourceButton.name}
                  resourceType={resource.type}
                  resourceId={resource.id}
                  size="large"
                />
              ),
            ].map((tool, i) => (
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
            {backlinkField && lineSchema && (
              <LinesAndCosts
                lineSchema={lineSchema}
                resource={resource}
                lineQuery={{
                  '==': [{ var: backlinkField.name }, resource.id],
                }}
                newLineInitialData={[
                  {
                    fieldId: selectSchemaFieldUnsafe(lineSchema, backlinkField)
                      .fieldId,
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
