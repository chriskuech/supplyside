'use client'

import { ResourceType } from '@prisma/client'
import { useEffect, useState } from 'react'
import { readSchema } from './actions'
import { Schema } from '@/domain/schema/entity'

const useSchema = (resourceType: ResourceType): Schema | null | undefined => {
  const [schema, setSchema] = useState<Schema | null>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (
      !isLoading &&
      schema !== null &&
      resourceType !== schema?.resourceType
    ) {
      setIsLoading(true)
      readSchema({ resourceType })
        .then(setSchema)
        .catch(() => setSchema(null))
        .finally(() => setIsLoading(false))
    }
  }, [isLoading, resourceType, schema, schema?.resourceType])

  return schema
}

export default useSchema
