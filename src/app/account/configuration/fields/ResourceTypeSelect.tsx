import { Autocomplete, TextField } from '@mui/material'
import { ResourceType } from '@prisma/client'

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
      options={Object.values(ResourceType)}
      value={resourceType}
      disabled={!setResourceType}
      onChange={(e, value) => setResourceType?.(value ?? undefined)}
      renderInput={(params) => <TextField {...params} />}
    ></Autocomplete>
  )
}
