import { Alert, Card, CardContent, Stack, Typography } from '@mui/material'
import {
  Resource,
  fields,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { FC } from 'react'
import { JobLineView } from './JobLineView'
import { StepsControl } from './StepsControl'
import { DeleteJobLineButton } from './DeleteJobLineButton'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import { readSchema } from '@/client/schema'
import { readResources } from '@/client/resource'

type Props = {
  job: Resource
}

export const JobLinesControl: FC<Props> = async ({ job }) => {
  const [jobLineSchema, stepSchema, jobLines] = await Promise.all([
    readSchema(job.accountId, 'JobLine'),
    readSchema(job.accountId, 'Step'),
    readResources(job.accountId, 'JobLine', {
      where: {
        '==': [{ var: fields.job.name }, job.id],
      },
    }),
  ])

  if (!jobLineSchema || !stepSchema || !jobLines)
    return <Alert severity="error">Failed to load Job Lines</Alert>

  return (
    <Stack spacing={2}>
      {jobLines.map((jobLine, i) =>
        jobLines.length > 1 ? (
          <Card key={jobLine.id} variant="outlined">
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
              <DeleteJobLineButton jobLineId={jobLine.id} />
            </Stack>
            <CardContent>
              <Stack key={jobLine.id} spacing={2}>
                <JobLineView
                  jobLine={jobLine}
                  jobLineSchema={jobLineSchema}
                  i={i}
                  stepsControl={<StepsControl jobLine={jobLine} />}
                />
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Stack key={jobLine.id} spacing={2}>
            <JobLineView
              key={jobLine.id}
              jobLine={jobLine}
              jobLineSchema={jobLineSchema}
              i={i}
              stepsControl={<StepsControl jobLine={jobLine} />}
            />
          </Stack>
        ),
      )}
      <Stack direction="row" justifyContent="end">
        <CreateResourceButton
          label={jobLines.length <= 1 ? 'Additional Parts' : 'Part'}
          resourceType="JobLine"
          fields={[
            {
              fieldId: selectSchemaFieldUnsafe(jobLineSchema, fields.job)
                .fieldId,
              valueInput: { resourceId: job.id },
            },
            {
              fieldId: selectSchemaFieldUnsafe(jobLineSchema, fields.needDate)
                .fieldId,
              valueInput: {
                date: selectResourceFieldValue(job, fields.needDate)?.date,
              },
            },
          ]}
        />
      </Stack>
    </Stack>
  )
}
