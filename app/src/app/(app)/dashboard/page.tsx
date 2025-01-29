import { fail } from 'assert'
import { Container, Stack, Typography } from '@mui/material'
import {
  billStatusOptions,
  fields,
  jobStatusOptions,
  Schema,
} from '@supplyside/model'
import LateJobs from './LateJobs'
import LatePurchases from './LatePurchases'
import OverdueBills from './OverdueBills'
import OverdueInvoices from './OverdueInvoices'
import NetCashflowChart from './NetCashflowChart'
import { readResources } from '@/actions/resource'
import { readSchema } from '@/actions/schema'

export default async function Dashboard() {
  const [billSchemaData, jobSchemaData] = await Promise.all([
    (await readSchema('Bill')) ?? fail('Bill schema not found'),
    (await readSchema('Job')) ?? fail('Job schema not found'),
  ])

  const billSchema = new Schema(billSchemaData)
  const jobSchema = new Schema(jobSchemaData)

  const [jobs, bills, recurringBills] = await Promise.all([
    readResources('Job', {
      where: {
        '!=': [
          { var: fields.jobStatus.name },
          jobSchema.getFieldOption(fields.jobStatus, jobStatusOptions.canceled)
            .id,
        ],
      },
    }),
    readResources('Bill', {
      where: {
        and: [
          { '!=': [{ var: fields.recurring.name }, true] },
          {
            '!=': [
              { var: fields.billStatus.name },
              billSchema.getFieldOption(
                fields.billStatus,
                billStatusOptions.canceled,
              ).id,
            ],
          },
        ],
      },
    }),
    readResources('Bill', {
      where: {
        and: [
          { '==': [{ var: fields.recurring.name }, true] },
          {
            '!=': [
              { var: fields.billStatus.name },
              billSchema.getFieldOption(
                fields.billStatus,
                billStatusOptions.canceled,
              ).id,
            ],
          },
        ],
      },
    }),
  ])

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Stack height={400}>
        <NetCashflowChart
          jobs={jobs ?? []}
          bills={bills ?? []}
          recurringBills={recurringBills ?? []}
        />
      </Stack>
      <Stack direction="row" spacing={1}>
        <OverdueBills />
        <OverdueInvoices />
        <LateJobs />
        <LatePurchases />
      </Stack>
    </Container>
  )
}
