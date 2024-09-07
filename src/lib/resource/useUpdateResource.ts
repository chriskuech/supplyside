import { useMemo } from 'react'
import { debounce } from 'remeda'
import { updateResource as updateResourceAction } from './actions'
import { Resource } from '@/domain/resource/types'

export const useUpdateResource = () =>
  useMemo(
    () =>
      debounce((resource: Resource) => updateResourceAction({ resource }), {
        timing: 'trailing',
        waitMs: 500,
      }).call,
    [],
  )
