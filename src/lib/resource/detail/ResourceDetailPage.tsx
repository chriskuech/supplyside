import { Box, Container, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { match, P } from 'ts-pattern'
import ResourceForm from '../ResourceForm'
import ReadOnlyFieldsView from '../ReadOnlyFieldsView'
import LinesAndCosts from './LinesAndCosts'
import DeleteResourceButton from './DeleteResourceButton'
import { Schema } from '@/domain/schema/types'
import { Resource } from '@/domain/resource/entity'
import { FieldTemplate } from '@/domain/schema/template/types'

type Props = {
  schema: Schema
  resource: Resource
  name?: string | null
  tools: readonly ReactNode[]
  isReadOnly?: boolean
  backlinkField?: FieldTemplate
  actions?: ReactNode
}

export default function ResourceDetailPage({
  schema,
  resource,
  name,
  tools,
  backlinkField,
  isReadOnly,
  actions,
}: Props) {
  return (
    <Stack>
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
            <DeleteResourceButton
              key="delete-resource-button"
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
            <ResourceForm schema={schema} resource={resource} />
          )}
          {backlinkField && (
            <LinesAndCosts
              resource={resource}
              lineQuery={{
                '==': [{ var: backlinkField.name }, resource.id],
              }}
              newLineInitialData={{
                [backlinkField.name]: resource.id,
              }}
              isReadOnly={isReadOnly}
            />
          )}
        </Stack>
      </Container>
    </Stack>
  )
}
