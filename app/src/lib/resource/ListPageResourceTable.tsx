'use client'

import { FC, useCallback, useMemo } from 'react'
import { GridFilterModel } from '@mui/x-data-grid'
import { Resource, Schema } from '@supplyside/model'
import { useRouter } from 'next/navigation'
import { debounce } from 'remeda'
import ResourceTable from './table/ResourceTable'

type Props = {
  tableKey: string
  schema: Schema
  resources: Resource[]
  initialGridFilterModel?: GridFilterModel
}

export const ListPageResourceTable: FC<Props> = ({
  tableKey,
  schema,
  resources,
  initialGridFilterModel,
}) => {
  const router = useRouter()

  const saveGridFilterModel = useCallback(
    (model: GridFilterModel) =>
      router.replace(
        `${window.location.pathname}?filter=${encodeURIComponent(JSON.stringify(model))}`,
      ),
    [router],
  )

  const saveGridFilterModelDebounced = useMemo(
    () =>
      saveGridFilterModel &&
      debounce(saveGridFilterModel, {
        timing: 'trailing',
        waitMs: 500,
      }).call,
    [saveGridFilterModel],
  )

  return (
    <ResourceTable
      tableKey={tableKey}
      schema={schema}
      resources={resources}
      initialGridFilterModel={initialGridFilterModel}
      saveGridFilterModel={saveGridFilterModelDebounced}
    />
  )
}
