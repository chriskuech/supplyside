'use client'

import {
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import {
  Resource,
  Schema,
  fields,
  selectResourceFieldValue,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { FC } from 'react'
import { Close } from '@mui/icons-material'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import { deleteResource } from '@/actions/resource'
import FieldControl from '@/lib/resource/fields/FieldControl'
import { formatMoney } from '@/lib/format'

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
            pb={0}
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
        job={job}
        label={jobLines.length <= 1 ? 'Additional Parts' : 'Part'}
        jobLineSchema={jobLineSchema}
      />
    </Stack>
  </Stack>
)

const CreateJobLineButton: FC<{
  jobLineSchema: Schema
  job: Resource
  label: string
}> = ({ job, jobLineSchema, label }) => (
  <CreateResourceButton
    label={label}
    resourceType="JobLine"
    fields={[
      {
        fieldId: selectSchemaFieldUnsafe(jobLineSchema, fields.job).fieldId,
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
)

const JobLineView: FC<{
  jobLine: Resource
  jobLineSchema: Schema
  i: number
}> = ({ jobLine, jobLineSchema }) => (
  <Stack spacing={2} direction="row" alignItems="start">
    <Stack spacing={1} flexGrow={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box flexGrow={1}>
          <FieldControl
            resource={jobLine}
            inputId={`part-name-${jobLine.id}`}
            field={selectSchemaFieldUnsafe(jobLineSchema, fields.partName)}
            inputProps={{
              placeholder: 'Part Name',
            }}
          />
        </Box>
        <Box>
          <FieldControl
            resource={jobLine}
            inputId={`need-date-${jobLine.id}`}
            field={selectSchemaFieldUnsafe(jobLineSchema, fields.needDate)}
            inputProps={{
              placeholder: 'Need Date',
            }}
          />
        </Box>
      </Stack>
      <Box>
        <FieldControl
          resource={jobLine}
          inputId={`other-notes-${jobLine.id}`}
          field={selectSchemaFieldUnsafe(jobLineSchema, fields.otherNotes)}
          inputProps={{
            placeholder: 'Other Notes',
          }}
        />
      </Box>
    </Stack>
    <Divider orientation="vertical" flexItem />
    <Stack spacing={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box width={100}>
          <FieldControl
            resource={jobLine}
            inputId={`quantity-${jobLine.id}`}
            field={selectSchemaFieldUnsafe(jobLineSchema, fields.quantity)}
            inputProps={{
              placeholder: 'Qty',
            }}
          />
        </Box>
        <Box>&times;</Box>
        <Box width={140}>
          <FieldControl
            resource={jobLine}
            inputId={`unit-cost-${jobLine.id}`}
            field={selectSchemaFieldUnsafe(jobLineSchema, fields.unitCost)}
            inputProps={{
              placeholder: 'Unit Cost',
            }}
          />
        </Box>
      </Stack>
      <Stack
        direction="row"
        justifyContent="end"
        alignItems="center"
        spacing={1}
      >
        <Box>=</Box>
        <Typography fontWeight="bold" fontSize="1.7em">
          {formatMoney(
            selectResourceFieldValue(jobLine, fields.totalCost)?.number,
          )}
        </Typography>
      </Stack>
    </Stack>
  </Stack>
)
