'use client'

import { Stack, Typography, Box, CircularProgress } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { readSchema } from '../schema/actions'
import { readResource, readResources } from './actions'
import CreateResourceButton from '@/lib/resource/CreateResourceButton'
import ItemizedCostLines from '@/lib/resource/ItemizedCostLines'
import ResourceTable from '@/lib/resource/ResourceTable'
import { Data, Resource } from '@/domain/resource/types'
import { Schema } from '@/domain/schema/types'
import { Where } from '@/domain/resource/json-logic/types'

type Props = {
  resourceId: string
  lineQuery: Where
  newLineInitialData: Data
}

export default function LinesAndCosts({
  resourceId,
  lineQuery,
  newLineInitialData,
}: Props) {
  const [resource, setResource] = useState<Resource>()
  const [lineSchema, setLineSchema] = useState<Schema>()
  const [lines, setLines] = useState<Resource[]>()

  const refresh = useCallback(() => {
    readResource({ id: resourceId }).then(setResource)
    readSchema({ resourceType: 'Line' }).then(setLineSchema)
    readResources({ type: 'Line', where: lineQuery }).then(setLines)
  }, [resourceId, lineQuery])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!resource || !lineSchema || !lines) {
    return <CircularProgress />
  }

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
          onChange={refresh}
        />
        <Box width={'60%'}>
          <ItemizedCostLines resource={resource} onChange={refresh} />
        </Box>
      </Stack>
    </Stack>
  )
}
