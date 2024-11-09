import { fields, Resource } from '@supplyside/model'
import { Alert } from '@mui/material'
import StepsView from './StepsView'
import { readSchema } from '@/client/schema'
import { readResources } from '@/client/resource'

type Props = {
  jobLine: Resource
}

export const StepsControl = async ({ jobLine }: Props) => {
  const [stepSchema, steps] = await Promise.all([
    readSchema(jobLine.accountId, 'Step'),
    readResources(jobLine.accountId, 'Step', {
      where: {
        '==': [{ var: fields.jobLine.name }, jobLine.id],
      },
      orderBy: [{ var: fields.startDate.name }],
    }),
  ])

  if (!stepSchema || !steps)
    return <Alert severity="error">Failed to load steps</Alert>

  return <StepsView stepSchema={stepSchema} steps={steps} jobLine={jobLine} />
}
