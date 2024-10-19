import { fail } from 'assert'
import {
  fields,
  jobStatusOptions,
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import Charts from '../charts/Charts'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function OpenJobs({
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

  const openJobsFilter: GridFilterItem = {
    field: jobStatusField.fieldId,
    operator: 'isAnyOf',
    value: jobStatusField.options
      .filter(
        (option) =>
          ![jobStatusPaidOptionId, jobStatusCanceledOptionId].includes(
            option.id,
          ),
      )
      .map((option) => option.id),
  }

  return (
    <ListPage
      tableKey="jobsList"
      resourceType="Job"
      searchParams={searchParams}
      filterItems={[openJobsFilter]}
      title="Open Jobs"
      Charts={Charts}
    />
  )
}
