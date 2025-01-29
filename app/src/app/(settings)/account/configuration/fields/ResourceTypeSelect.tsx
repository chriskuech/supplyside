import { Autocomplete, TextField } from '@mui/material'
import { ResourceType, resourceTypes } from '@supplyside/model'

type Props = {
  resourceType: ResourceType | undefined
  setResourceType?: (resourceType: ResourceType | undefined) => void
}

export default function ResourceTypeSelect({
  resourceType,
  setResourceType,
}: Props) {
  return (
    <Autocomplete<ResourceType>
      size="small"
      fullWidth
      options={resourceTypes}
      value={resourceType}
      disabled={!setResourceType}
      onChange={(e, value) => setResourceType?.(value ?? undefined)}
      renderInput={(params) => <TextField {...params} />}
    />
  )
}
