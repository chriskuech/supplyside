import { fail } from 'assert'
import { fields, jobStatusOptions, Schema } from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import GridApiCharts from '../charts/GridApiCharts'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function OpenJobs({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const jobSchemaData =
    (await readSchema('Job')) ?? fail('Job schema not found')
  const jobSchema = new Schema(jobSchemaData)

  const jobStatusField = jobSchema.getField(fields.jobStatus)
  const jobStatusPaidOptionId = jobSchema.getFieldOption(
    fields.jobStatus,
    jobStatusOptions.paid,
  ).id
  const jobStatusCanceledOptionId = jobSchema.getFieldOption(
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
      Charts={GridApiCharts}
    />
  )
}
