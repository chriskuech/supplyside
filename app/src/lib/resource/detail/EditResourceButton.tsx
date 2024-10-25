'use client'
import { Edit } from '@mui/icons-material'
import { Box, Tooltip, IconButton } from '@mui/material'
import { FieldTemplate, OptionTemplate } from '@supplyside/model'
import { transitionStatus } from '@/actions/resource'

type Props = {
  resourceId: string
  fontSize: 'small' | 'medium' | 'large'
  statusFieldTemplate: FieldTemplate
  draftStatusOptionTemplate: OptionTemplate
}

export default function EditResourceControl({
  resourceId,
  fontSize,
  statusFieldTemplate,
  draftStatusOptionTemplate,
}: Props) {
  return (
    <Box height="min-content">
      <Tooltip title="Transition back to Draft for editing">
        <IconButton
          onClick={() =>
            transitionStatus(
              resourceId,
              statusFieldTemplate,
              draftStatusOptionTemplate,
            )
          }
          sx={{ '.MuiButtonBase-root': { m: 0, p: 0 } }}
          size="small"
        >
          <Edit fontSize={fontSize} />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
