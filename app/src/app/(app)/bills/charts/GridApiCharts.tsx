'use client'

import { gridFilteredSortedRowEntriesSelector } from '@mui/x-data-grid'
import { GridApiPro } from '@mui/x-data-grid-pro'
import {
  MutableRefObject,
  PropsWithChildren,
  useLayoutEffect,
  useState,
} from 'react'
import { Resource } from '@supplyside/model'
import Charts from './Charts'

type Props = {
  gridApiRef: MutableRefObject<GridApiPro>
}

export default function GridApiCharts({
  gridApiRef,
}: PropsWithChildren<Props>) {
  const [resources, setResources] = useState<Resource[]>()

  useLayoutEffect(() => {
    gridApiRef.current.subscribeEvent('rowsSet', () => {
      const rows = gridFilteredSortedRowEntriesSelector(gridApiRef)
      setResources(rows.map((row) => row.model as Resource))
    })
  }, [gridApiRef])

  return <Charts resources={resources ?? []} />
}
