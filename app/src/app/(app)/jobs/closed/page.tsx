import { fail } from 'assert'
import { fields, jobStatusOptions, Schema } from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function ClosedJobs({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const jobSchemaData =
    (await readSchema('Job')) ?? fail('Job schema not found')
  const jobSchema = new Schema(jobSchemaData)

  const closedJobsFilter: GridFilterItem = {
    field: jobSchema.getField(fields.jobStatus).fieldId,
    operator: 'isAnyOf',
    value: [
      jobSchema.getFieldOption(fields.jobStatus, jobStatusOptions.paid).id,
      jobSchema.getFieldOption(fields.jobStatus, jobStatusOptions.canceled).id,
    ],
  }

  return (
    <ListPage
      tableKey="jobsList"
      resourceType="Job"
      searchParams={searchParams}
      filterItems={[closedJobsFilter]}
      title="Closed Jobs"
    />
  )
}
