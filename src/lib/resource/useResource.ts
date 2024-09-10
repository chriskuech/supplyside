import { useEffect, useState } from 'react'
import { readResource } from './actions'
import { Resource } from '@/domain/resource/entity'

const useResource = (resourceIdOrResource: string | Resource) => {
  const [resource, setResource] = useState<Resource | null>(
    typeof resourceIdOrResource === 'string' ? null : resourceIdOrResource,
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && !resource && typeof resourceIdOrResource === 'string') {
      setIsLoading(true)
      readResource({ id: resourceIdOrResource })
        .then(setResource)
        .finally(() => setIsLoading(false))
    }
  }, [isLoading, resource, resourceIdOrResource])

  return [resource, setResource] as const
}

export default useResource
