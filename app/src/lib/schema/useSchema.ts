import 'client-only'
import { useEffect, useState } from 'react'
import { ResourceType, Schema } from '@supplyside/model'
import { readSchema } from '@/actions/schema'

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
      readSchema(resourceType)
        .then((schema) => setSchema(schema ?? null))
        .catch(() => setSchema(null))
        .finally(() => setIsLoading(false))
    }
  }, [isLoading, resourceType, schema, schema?.resourceType])

  return schema
}

export default useSchema
