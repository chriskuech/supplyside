import { match } from 'ts-pattern'
import {
  Resource,
  fields,
  purchaseStatusOptions,
  selectResourceFieldValue,
} from '@supplyside/model'
import StatusTrackerView from '@/lib/ux/StatusTrackerView'

const happyPath: string[] = [
  purchaseStatusOptions.draft.name,
  purchaseStatusOptions.submitted.name,
  purchaseStatusOptions.approved.name,
  purchaseStatusOptions.purchased.name,
  purchaseStatusOptions.received.name,
]

const sadPath: string[] = [
  purchaseStatusOptions.draft.name,
  purchaseStatusOptions.submitted.name,
  purchaseStatusOptions.approved.name,
  purchaseStatusOptions.purchased.name,
  purchaseStatusOptions.canceled.name,
]

type Props = {
  resource: Resource
}

export default function PurchaseStatusTracker({ resource }: Props) {
  const value = selectResourceFieldValue(
    resource,
    fields.purchaseStatus,
  )?.option

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
