import { match } from 'ts-pattern'
import {
  OptionTemplate,
  Resource,
  fields,
  jobStatusOptions,
  selectResourceFieldValue,
} from '@supplyside/model'
import StatusTrackerView from '@/lib/ux/StatusTrackerView'

const happyPath: OptionTemplate[] = [
  jobStatusOptions.draft,
  jobStatusOptions.ordered,
  jobStatusOptions.inProcess,
  jobStatusOptions.shipped,
  jobStatusOptions.invoiced,
  jobStatusOptions.paid,
]

const sadPath: OptionTemplate[] = [
  jobStatusOptions.draft,
  jobStatusOptions.ordered,
  jobStatusOptions.inProcess,
  jobStatusOptions.shipped,
  jobStatusOptions.paid,
  jobStatusOptions.canceled,
]

type Props = {
  resource: Resource
}

export default function JobStatusTracker({ resource }: Props) {
  const option =
    selectResourceFieldValue(resource, fields.jobStatus)?.option ?? null

  if (!option) return '❌ Field value not found'

  return match(option)
    .with({ templateId: jobStatusOptions.canceled.templateId }, () => (
      <StatusTrackerView
        steps={sadPath.map(({ name }, i) => ({
          label: name,
          status: 'fail',
          isActive: i === happyPath.length - 1,
        }))}
      />
    ))
    .with({ templateId: jobStatusOptions.paid.templateId }, () => (
      <StatusTrackerView
        steps={happyPath.map(({ name }, i) => ({
          label: name,
          status: 'success',
          isActive: i === sadPath.length - 1,
        }))}
      />
    ))
    .otherwise((activeOption) => (
      <StatusTrackerView
        steps={happyPath.map(
          (option, i) =>
            ({
              label: option.name,
              status:
                i <=
                happyPath.findIndex(
                  (o) => o.templateId === activeOption.templateId,
                )
                  ? 'in-progress'
                  : 'not-started',
              isActive: option.templateId === activeOption.templateId,
            }) as const,
        )}
      />
    ))
}
