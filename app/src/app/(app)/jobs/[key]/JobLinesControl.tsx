'use client'

import { Card, CardContent, IconButton, Stack, Typography } from '@mui/material'
import {
  Resource,
  Schema,
  fields,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { FC } from 'react'
import { Close } from '@mui/icons-material'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import ResourceForm from '@/lib/resource/ResourceForm'
import { deleteResource } from '@/actions/resource'

type Props = {
  job: Resource
  jobLineSchema: Schema
  jobLines: Resource[]
  isReadOnly?: boolean
}

export const JobLinesControl: FC<Props> = ({
  job,
  jobLineSchema,
  jobLines,
}) => (
  <Stack spacing={2}>
    {jobLines.map((jobLine, i) =>
      jobLines.length > 1 ? (
        <Card key={jobLine.id} variant="outlined">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignContent="center"
            p={1}
          >
            <Typography variant="overline" sx={{ opacity: 0.5 }}>
              Part #{i + 1}
            </Typography>
            <IconButton onClick={() => deleteResource(jobLine.id)} size="small">
              <Close fontSize="small" />
            </IconButton>
          </Stack>
          <CardContent>
            <JobLineView
              jobLine={jobLine}
              jobLineSchema={jobLineSchema}
              i={i}
            />
          </CardContent>
        </Card>
      ) : (
        <JobLineView
          key={jobLine.id}
          jobLine={jobLine}
          jobLineSchema={jobLineSchema}
          i={i}
        />
      ),
    )}
    <Stack direction="row" justifyContent="end">
      <CreateJobLineButton
        label={jobLines.length <= 1 ? 'Additional Parts' : 'Part'}
        jobId={job.id}
        jobLineSchema={jobLineSchema}
      />
    </Stack>
  </Stack>
)

const CreateJobLineButton: FC<{
  jobLineSchema: Schema
  jobId: string
  label: string
}> = ({ jobLineSchema, jobId, label }) => (
  <CreateResourceButton
    label={label}
    resourceType="JobLine"
    fields={[
      {
        fieldId: selectSchemaFieldUnsafe(jobLineSchema, fields.job).fieldId,
        valueInput: { resourceId: jobId },
      },
    ]}
  />
)

const JobLineView: FC<{
  jobLine: Resource
  jobLineSchema: Schema
  i: number
}> = ({ jobLine, jobLineSchema }) => (
  <ResourceForm schema={jobLineSchema} resource={jobLine} />
)
