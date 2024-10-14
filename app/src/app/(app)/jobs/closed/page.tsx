import { fail } from 'assert'
import {
  fields,
  jobStatusOptions,
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function ClosedJobs({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const jobSchema = (await readSchema('Job')) ?? fail('Job schema not found')

  const jobStatusField = selectSchemaFieldUnsafe(jobSchema, fields.jobStatus)
  const jobStatusPaidOptionId = selectSchemaFieldOptionUnsafe(
    jobSchema,
    fields.jobStatus,
    jobStatusOptions.paid,
  ).id
  const jobStatusCanceledOptionId = selectSchemaFieldOptionUnsafe(
    jobSchema,
    fields.jobStatus,
    jobStatusOptions.canceled,
  ).id

  const closedJobsFilter: GridFilterItem = {
    field: jobStatusField.fieldId,
    operator: 'isAnyOf',
    value: [jobStatusPaidOptionId, jobStatusCanceledOptionId],
  }

  return (
    <ListPage
      tableKey="closedJobList"
      resourceType="Job"
      searchParams={searchParams}
      filterItems={[closedJobsFilter]}
      title="Closed Jobs"
    />
  )
}
