import { fail } from 'assert'
import {
  fields,
  jobStatusOptions,
  selectSchemaFieldOptionUnsafe,
  selectSchemaFieldUnsafe,
} from '@supplyside/model'
import { GridFilterItem } from '@mui/x-data-grid'
import GridApiCharts from '../charts/GridApiCharts'
import ListPage from '@/lib/resource/ListPage'
import { readSchema } from '@/actions/schema'

export default async function InProcessJobs({
  searchParams,
}: {
  searchParams: Record<string, unknown>
}) {
  const jobSchema = (await readSchema('Job')) ?? fail('Job schema not found')

  const jobStatusField = selectSchemaFieldUnsafe(jobSchema, fields.jobStatus)
  const jobStatusInProcessOptionId = selectSchemaFieldOptionUnsafe(
    jobSchema,
    fields.jobStatus,
    jobStatusOptions.inProcess,
  ).id

  const inProcessJobsFilter: GridFilterItem = {
    field: jobStatusField.fieldId,
    operator: 'isAnyOf',
    value: jobStatusField.options
      .map((option) => option.id)
      .filter((optionId) => optionId === jobStatusInProcessOptionId),
  }

  return (
    <ListPage
      tableKey="jobsList"
      resourceType="Job"
      searchParams={searchParams}
      filterItems={[inProcessJobsFilter]}
      title="In Process Jobs"
      Charts={GridApiCharts}
    />
  )
}
