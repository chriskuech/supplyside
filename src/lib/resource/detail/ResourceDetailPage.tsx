import { Box, Container, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { match, P } from 'ts-pattern'
import ResourceForm from '../ResourceForm'
import ReadOnlyFieldsView from './ReadOnlyFieldsView'
import LinesAndCosts from './LinesAndCosts'
import DeleteResourceButton from './DeleteResourceButton'
import DuplicateResourceButton from './DuplicateResourceButton'
import HandleJustCloned from './HandleJustCloned'
import { Schema } from '@/domain/schema/entity'
import { selectSchemaFieldUnsafe } from '@/domain/schema/extensions'
import { Resource } from '@/domain/resource/entity'
import { FieldTemplate } from '@/domain/schema/template/types'

type Props = {
  schema: Schema
  lineSchema: Schema
  resource: Resource
  name?: string | null
  tools: readonly ReactNode[]
  isReadOnly?: boolean
  backlinkField?: FieldTemplate
  actions?: ReactNode
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
}: Props) {
  return (
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
            <DeleteResourceButton
              key={DeleteResourceButton.name}
              resourceType={resource.type}
              resourceId={resource.id}
            />,
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
            <ResourceForm
              resourceType={schema.resourceType}
              resource={resource}
            />
          )}
          {backlinkField && (
            <LinesAndCosts
              resource={resource}
              lineQuery={{
                '==': [{ var: backlinkField.name }, resource.id],
              }}
              newLineInitialData={[
                {
                  fieldId: selectSchemaFieldUnsafe(lineSchema, backlinkField)
                    .id,
                  value: { resourceId: resource.id },
                },
              ]}
              isReadOnly={isReadOnly}
            />
          )}
        </Stack>
      </Container>
    </Stack>
  )
}
