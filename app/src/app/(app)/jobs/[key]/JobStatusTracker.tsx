import { match } from 'ts-pattern'
import {
  Resource,
  fields,
  jobStatusOptions,
  selectResourceFieldValue,
} from '@supplyside/model'
import StatusTrackerView from '@/lib/ux/StatusTrackerView'
//TODO: missing in progress and paid statuses, do we delete them?
const happyPath: string[] = [
  jobStatusOptions.draft.name,
  jobStatusOptions.ordered.name,
  jobStatusOptions.inProcess.name,
  jobStatusOptions.shipped.name,
  jobStatusOptions.invoiced.name,
  jobStatusOptions.paid.name,
]

const sadPath: string[] = [
  jobStatusOptions.draft.name,
  jobStatusOptions.ordered.name,
  jobStatusOptions.inProcess.name,
  jobStatusOptions.shipped.name,
  jobStatusOptions.paid.name,
  jobStatusOptions.canceled.name,
]

type Props = {
  resource: Resource
}

export default function JobStatusTracker({ resource }: Props) {
  const value = selectResourceFieldValue(resource, fields.jobStatus)?.option

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
