import { ResourceType } from '@prisma/client'
import { useEffect, useState } from 'react'
import { readSchema } from './actions'
import { Schema } from '@/domain/schema/entity'

const useSchema = (resourceType: ResourceType): Schema | null => {
  const [schema, setSchema] = useState<Schema | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && resourceType !== schema?.resourceType) {
      setIsLoading(true)
      readSchema({ resourceType })
        .then(setSchema)
        .finally(() => setIsLoading(false))
    }
  }, [isLoading, resourceType, schema?.resourceType])

  return schema
}

export default useSchema
