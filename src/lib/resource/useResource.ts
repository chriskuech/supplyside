import 'client-only'
import { useCallback, useEffect, useState } from 'react'
import { readResource, updateResource } from './actions'
import { Resource } from '@/domain/resource/entity'
import { mapValueToValueInput } from '@/domain/resource/mappers'

const useResource = (resourceId?: string) => {
  const [resource, setLocalResource] = useState<Resource | null>()
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!resourceId) return
    if (!isLoading && !isError && resourceId !== resource?.id) {
      setIsLoading(true)
      readResource({ id: resourceId })
        .then(setLocalResource)
        .catch(() => {
          setIsError(true)
          setLocalResource(null)
        })
        .finally(() => setIsLoading(false))
    }
  }, [isError, isLoading, resource, resourceId])

  const setApiResource = useCallback(
    (resource: Resource) =>
      updateResource({
        resourceId: resource.id,
        fields: resource.fields.map(({ fieldId, fieldType, value }) => ({
          fieldId,
          value: mapValueToValueInput(fieldType, value),
        })),
      })
        .then(setLocalResource)
        .catch(() => setIsError(true)),
    [],
  )

  return [resource, setApiResource] as const
}

export default useResource
