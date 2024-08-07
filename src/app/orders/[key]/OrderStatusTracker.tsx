import { match } from 'ts-pattern'
import StatusTrackerView from '@/lib/ux/StatusTrackerView'
import { Resource, selectValue } from '@/domain/resource/types'
import { fields } from '@/domain/schema/template/system-fields'

const happyPath: string[] = [
  'Draft',
  'Submitted',
  'Approved',
  'Ordered',
  'Received',
]

const sadPath: string[] = [
  'Draft',
  'Submitted',
  'Approved',
  'Ordered',
  'Canceled',
]

type Props = {
  resource: Resource
}

export default function OrderStatusTracker({ resource }: Props) {
  const value = selectValue(resource, fields.orderStatus)?.option

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
