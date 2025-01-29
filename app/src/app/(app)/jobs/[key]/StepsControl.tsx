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
  const [stepSchemaData, steps, operationSchema] = await Promise.all([
    readSchema(part.accountId, 'Step'),
    readResources(part.accountId, 'Step', {
      where: {
        '==': [{ var: fields.part.name }, part.id],
      },
      // TODO: this doesn't work
      // orderBy: [{ var: fields.deliveryDate.name, dir: 'asc' }],
    }),
    readSchema(part.accountId, 'Operation'),
  ])
  const expandedSteps = await Promise.all(
    (steps ?? []).map(async (step) => {
      const purchaseId = selectResourceFieldValue(step, fields.purchase)
        ?.resource?.id

      const purchase = purchaseId
        ? await readResource(part.accountId, purchaseId)
        : undefined

      const operations = await readResources(part.accountId, 'Operation', {
        where: {
          '==': [{ var: fields.step.name }, step.id],
        },
      })

      return { step, purchase, operations }
    }),
  )

  const sortedSteps = sortBy(
    expandedSteps,
    (s) => selectResourceFieldValue(s.step, fields.deliveryDate)?.date ?? '',
  )

  if (!stepSchemaData || !steps || !operationSchema)
    return <Alert severity="error">Failed to load steps</Alert>

  return (
    <StepsView
      stepSchemaData={stepSchemaData}
      steps={sortedSteps}
      operationSchema={operationSchema}
      part={part}
    />
  )
}
