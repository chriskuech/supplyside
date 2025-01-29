import 'client-only'
import { useEffect, useState } from 'react'
import { Resource, ResourceType } from '@supplyside/model'
import { readResources } from '@/actions/resource'
import { JsonLogic } from '@/client/resource'

export const useResources = (
  resourceType: ResourceType,
  where: JsonLogic | undefined,
) => {
  const [resources, setResources] = useState<Resource[] | null>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => setResources(undefined), [where])

  useEffect(() => {
    if (!isLoading && resources === undefined) {
      setIsLoading(true)
      readResources(resourceType, { where })
        .then((resources) => setResources(resources ?? null))
        .catch(() => setResources(null))
        .finally(() => setIsLoading(false))
    }
  }, [isLoading, resourceType, resources, where])

  return resources
}
