import { useEffect, useState } from 'react'
import { ResourceType } from '@prisma/client'
import { Resource } from '@/domain/resource/entity'
import { readResources } from '@/lib/resource/actions'
import { Where } from '@/domain/resource/json-logic/types'

export const useResources = (
  resourceType: ResourceType,
  where: Where | undefined,
) => {
  const [resources, setResources] = useState<Resource[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => setResources(null), [where])

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true)
      readResources({ type: resourceType, where })
        .then(setResources)
        .finally(() => setIsLoading(false))
    }
  }, [isLoading, where, resourceType])

  return resources
}
