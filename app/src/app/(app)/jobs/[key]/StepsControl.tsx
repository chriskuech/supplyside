import { fields, Resource } from '@supplyside/model'
import { Alert } from '@mui/material'
import StepsView from './StepsView'
import { readSchema } from '@/client/schema'
import { readResources } from '@/client/resource'

type Props = {
  part: Resource
}

export const StepsControl = async ({ part }: Props) => {
  const [stepSchema, steps] = await Promise.all([
    readSchema(part.accountId, 'Step'),
    readResources(part.accountId, 'Step', {
      where: {
        '==': [{ var: fields.part.name }, part.id],
      },
      orderBy: [{ var: fields.startDate.name }],
    }),
  ])

  if (!stepSchema || !steps)
    return <Alert severity="error">Failed to load steps</Alert>

  return <StepsView stepSchema={stepSchema} steps={steps} part={part} />
}
