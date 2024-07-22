import { MenuItem, Select } from '@mui/material'
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
    <Select
      size="small"
      labelId="field-resource-type-label"
      fullWidth
      label="Resource Type"
      value={resourceType ?? ''}
      disabled={!setResourceType}
      onChange={(e) =>
        setResourceType?.(e.target.value as ResourceType | undefined)
      }
    >
      <MenuItem value={undefined}>&nbsp;</MenuItem>
      {Object.values(ResourceType).map((rt) => (
        <MenuItem value={rt} key={rt}>
          {rt}
        </MenuItem>
      ))}
    </Select>
  )
}
