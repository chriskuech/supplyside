import { match } from 'ts-pattern'
import StatusTrackerView from '@/lib/ux/StatusTrackerView'
import { selectResourceField } from '@/domain/resource/extensions'
import { Resource } from '@/domain/resource/entity'
import {
  billStatusOptions,
  fields,
} from '@/domain/schema/template/system-fields'

const happyPath: string[] = [
  billStatusOptions.draft.name,
  billStatusOptions.submitted.name,
  billStatusOptions.approved.name,
  billStatusOptions.paid.name,
]

const sadPath: string[] = [
  billStatusOptions.draft.name,
  billStatusOptions.submitted.name,
  billStatusOptions.approved.name,
  billStatusOptions.canceled.name,
]

type Props = {
  resource: Resource
}

export default function BillStatusTracker({ resource }: Props) {
  const value = selectResourceField(resource, fields.billStatus)?.value.option

  if (!value) return '❌ Field value not found'

  return match(value.name)
    .with(billStatusOptions.canceled.name, () => (
      <StatusTrackerView
        steps={sadPath.map((label, i) => ({
          label,
          status: 'fail',
          isActive: i === happyPath.length - 1,
        }))}
      />
    ))
    .with(billStatusOptions.paid.name, () => (
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
