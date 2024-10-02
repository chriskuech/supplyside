import 'client-only'

import { useCallback, useEffect, useState } from 'react'
import { Resource, mapValueToValueInput } from '@supplyside/model'
import { readResource, updateResource } from '@/actions/resource'

const useResource = (resourceId?: string) => {
  const [resource, setLocalResource] = useState<Resource | null>()
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!resourceId) return
    if (!isLoading && !isError && resourceId !== resource?.id) {
      setIsLoading(true)
      readResource(resourceId)
        .then((resource) => setLocalResource(resource ?? null))
        .catch(() => {
          setIsError(true)
          setLocalResource(null)
        })
        .finally(() => setIsLoading(false))
    }
  }, [isError, isLoading, resource, resourceId])

  const setApiResource = useCallback(
    (resource: Resource) =>
      updateResource(
        resource.id,
        resource.fields.map(({ fieldId, fieldType, value }) => ({
          fieldId,
          valueInput: mapValueToValueInput(fieldType, value),
        })),
      )
        .then((resource) => setLocalResource(resource ?? null))
        .catch(() => setIsError(true)),
    [],
  )

  return [resource, setApiResource] as const
}

export default useResource
