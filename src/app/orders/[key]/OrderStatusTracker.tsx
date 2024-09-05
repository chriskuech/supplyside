import { match } from 'ts-pattern'
import StatusTrackerView from '@/lib/ux/StatusTrackerView'
import { Resource, selectResourceField } from '@/domain/resource/types'
import {
  fields,
  orderStatusOptions,
} from '@/domain/schema/template/system-fields'

const happyPath: string[] = [
  orderStatusOptions.draft.name,
  orderStatusOptions.submitted.name,
  orderStatusOptions.approved.name,
  orderStatusOptions.ordered.name,
  orderStatusOptions.received.name,
]

const sadPath: string[] = [
  orderStatusOptions.draft.name,
  orderStatusOptions.submitted.name,
  orderStatusOptions.approved.name,
  orderStatusOptions.ordered.name,
  orderStatusOptions.canceled.name,
]

type Props = {
  resource: Resource
}

export default function OrderStatusTracker({ resource }: Props) {
  const value = selectResourceField(resource, fields.orderStatus)?.option

  if (!value) return '❌ Field value not found'

  return match(value.name)
    .with('Canceled', () => (
      <StatusTrackerView
        steps={sadPath.map((label, i) => ({
          label,
          status: 'fail',
          isActive: i === happyPath.length - 1,
        }))}
      />
    ))
    .with('Received', () => (
      <StatusTrackerView
        steps={happyPath.map((label, i) => ({
          label,
          status: 'success',
          isActive: i === sadPath.length - 1,
        }))}
      />
    ))
    .otherwise((statusLabel) => (
      <StatusTrackerView
        steps={happyPath.map((label, i) =>
          match(label)
            .with(
              statusLabel,
              () =>
                ({
                  label: statusLabel,
                  status: 'in-progress',
                  isActive: true,
                }) as const,
            )
            .otherwise(
              () =>
                ({
                  label,
                  status:
                    i < happyPath.indexOf(statusLabel)
                      ? 'in-progress'
                      : 'not-started',
                  isActive: false,
                }) as const,
            ),
        )}
      />
    ))
}
