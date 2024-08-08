import { Stack, Typography, Box } from '@mui/material'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import ItemizedCostLines from '@/lib/resource/ItemizedCostLines'
import ResourceTable from '@/lib/resource/ResourceTable'
import { Data, Resource } from '@/domain/resource/types'
import { Schema } from '@/domain/schema/types'

type Props = {
  resource: Resource
  lineSchema: Schema
  lines: Resource[]
  newLineInitialData: Data
}

export default function LinesAndCosts({
  lineSchema,
  lines,
  resource,
  newLineInitialData,
}: Props) {
  return (
    <Stack spacing={2}>
      <Stack direction={'row'} alignItems={'end'}>
        <Typography variant="h4" flexGrow={1}>
          Lines
        </Typography>
        <CreateResourceButton type={'Line'} data={newLineInitialData} />
      </Stack>
      <Stack>
        <ResourceTable
          schema={lineSchema}
          resources={lines}
          isEditable
          sx={{
            borderBottomLeftRadius: 0,
          }}
          disableColumnFilter
          disableColumnResize
          disableColumnMenu
          hideFooter
        />
        <Box width={'60%'}>
          <ItemizedCostLines resource={resource} />
        </Box>
      </Stack>
    </Stack>
  )
}
