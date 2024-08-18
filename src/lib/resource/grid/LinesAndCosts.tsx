import { Stack, Typography, Box } from '@mui/material'
import { readResources } from '../actions'
import ItemizedCostLines from './ItemizedCostLines'
import ResourceTable from './ResourceTable'
import { readSchema } from '@/lib/schema/actions'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import { Data, Resource } from '@/domain/resource/types'
import { Where } from '@/domain/resource/json-logic/types'

type Props = {
  resource: Resource
  lineQuery: Where
  newLineInitialData: Data
}

export default async function LinesAndCosts({
  resource,
  lineQuery,
  newLineInitialData,
}: Props) {
  const [lines, lineSchema] = await Promise.all([
    readResources({ type: 'Line', where: lineQuery }),
    readSchema({ resourceType: 'Line' }),
  ])

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
          tableKey={'linesAndCosts'}
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
        <Box alignSelf="flex-end">
          <ItemizedCostLines resource={resource} />
        </Box>
      </Stack>
    </Stack>
  )
}
