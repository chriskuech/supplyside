'use client'

import {
  ComponentType,
  FC,
  MutableRefObject,
  useCallback,
  useMemo,
} from 'react'
import { GridFilterModel } from '@mui/x-data-grid'
import { Resource, SchemaData } from '@supplyside/model'
import { useRouter } from 'next/navigation'
import { debounce } from 'remeda'
import { GridApiPro } from '@mui/x-data-grid-pro'
import ResourceTable from './table/ResourceTable'

type Props = {
  tableKey: string
  schemaData: SchemaData
  resources: Resource[]
  initialGridFilterModel?: GridFilterModel
  unFilterableFieldIds?: string[]
  Charts?: ComponentType<{ gridApiRef: MutableRefObject<GridApiPro> }>
  recurringResources?: Resource[]
}

export const ListPageResourceTable: FC<Props> = ({
  tableKey,
  schemaData,
  resources,
  initialGridFilterModel,
  unFilterableFieldIds,
  Charts,
  recurringResources,
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
      debounce(saveGridFilterModel, {
        timing: 'trailing',
        waitMs: 500,
      }).call,
    [saveGridFilterModel],
  )

  return (
    <ResourceTable
      tableKey={tableKey}
      schemaData={schemaData}
      resources={resources}
      initialGridFilterModel={initialGridFilterModel}
      saveGridFilterModel={saveGridFilterModelDebounced}
      unFilterableFieldIds={unFilterableFieldIds}
      Charts={Charts}
      recurringResources={recurringResources}
    />
  )
}
