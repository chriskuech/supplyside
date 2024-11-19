import { fields, Resource, selectResourceFieldValue } from '@supplyside/model'
import { Alert } from '@mui/material'
import { sortBy } from 'remeda'
import StepsView from './StepsView'
import { readSchema } from '@/client/schema'
import { readResource, readResources } from '@/client/resource'

type Props = {
  part: Resource
}

export const StepsControl = async ({ part }: Props) => {
  const [stepSchemaData, steps] = await Promise.all([
    readSchema(part.accountId, 'Step'),
    readResources(part.accountId, 'Step', {
      where: {
        '==': [{ var: fields.part.name }, part.id],
      },
      // TODO: this doesn't work
      // orderBy: [{ var: fields.deliveryDate.name, dir: 'asc' }],
    }),
  ])
  const expandedSteps = await Promise.all(
    (steps ?? []).map(async (step) => {
      const purchaseId = selectResourceFieldValue(step, fields.purchase)
        ?.resource?.id

      const purchase = purchaseId
        ? await readResource(part.accountId, purchaseId)
        : undefined

      return { step, purchase }
    }),
  )

  const sortedSteps = sortBy(
    expandedSteps,
    (s) => selectResourceFieldValue(s.step, fields.deliveryDate)?.date ?? '',
  )

  if (!stepSchemaData || !steps)
    return <Alert severity="error">Failed to load steps</Alert>

  return (
    <StepsView
      stepSchemaData={stepSchemaData}
      steps={sortedSteps}
      part={part}
    />
  )
}
