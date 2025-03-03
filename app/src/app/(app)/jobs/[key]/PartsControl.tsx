import { Alert, Card, CardContent, Stack, Typography } from '@mui/material'
import { Resource, fields, selectResourceFieldValue } from '@supplyside/model'
import { FC } from 'react'
import { PartView } from './PartView'
import { StepsControl } from './StepsControl'
import { DeletePartButton } from './DeletePartButton'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import { readSchema } from '@/client/schema'
import { readResources } from '@/client/resource'

type Props = {
  job: Resource
}

export const PartsControl: FC<Props> = async ({ job }) => {
  const [partSchemaData, stepSchemaData, parts] = await Promise.all([
    readSchema(job.accountId, 'Part'),
    readSchema(job.accountId, 'Step'),
    readResources(job.accountId, 'Part', {
      where: {
        '==': [{ var: fields.job.name }, job.id],
      },
    }),
  ])

  if (!partSchemaData || !stepSchemaData || !parts)
    return <Alert severity="error">Failed to load Parts</Alert>

  const jobNeedDate = selectResourceFieldValue(job, fields.needDate)?.date

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Parts</Typography>
        <CreateResourceButton
          resourceType="Part"
          fields={[
            {
              field: fields.job,
              valueInput: { resourceId: job.id },
            },
            {
              field: fields.needDate,
              valueInput: { date: jobNeedDate },
            },
          ]}
        />
      </Stack>
      {parts.map((part, i) => (
        <Card key={part.id} variant="outlined">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignContent="center"
            p={1}
            pb={0}
          >
            <Typography variant="overline" sx={{ opacity: 0.5 }}>
              Part #{i + 1}
            </Typography>
            <DeletePartButton partId={part.id} />
          </Stack>
          <CardContent>
            <Stack spacing={2}>
              <PartView
                part={part}
                partSchemaData={partSchemaData}
                stepsControl={<StepsControl part={part} />}
              />
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}
