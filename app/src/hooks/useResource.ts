import 'client-only'
import { useEffect, useState } from 'react'
import { Resource } from '@supplyside/model'
import { readResource } from '@/actions/resource'

const useResource = (resourceId: string): Resource | null | undefined => {
  const [resource, setResource] = useState<Resource | null>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && resource !== null) {
      setIsLoading(true)
      readResource(resourceId)
        .then((schema) => setResource(schema ?? null))
        .catch(() => setResource(null))
        .finally(() => setIsLoading(false))
    }
  }, [isLoading, resource, resource?.type, resourceId])

  return resource
}

export default useResource
