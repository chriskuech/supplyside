import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { ResourceType } from '@prisma/client'
import { CircularProgress } from '@mui/material'
import { readSchema } from '../schema/actions'
import { readResource } from './actions'
import { useUpdateResource } from './useUpdateResource'
import { Resource } from '@/domain/resource/types'
import { Schema } from '@/domain/schema/types'

type Props = {
  resourceId: string
  resourceType: ResourceType
  children: (params: {
    resource: Resource
    schema: Schema
    onChange: Dispatch<SetStateAction<Resource | null>>
  }) => ReactNode
}

export default function ResourceEditContext({
  resourceId,
  resourceType,
  children,
}: Props) {
  const [schema, setSchema] = useState<Schema | null>(null)
  const [resource, setResource] = useState<Resource | null>(null)

  const changeHandler = useUpdateResource()

  useEffect(() => {
    readSchema({ resourceType }).then(setSchema)
    readResource({ id: resourceId }).then(setResource)
  }, [resourceType, resourceId])

  useEffect(() => {
    resource && changeHandler(resource)
  }, [resource, changeHandler])

  if (!schema || !resource) return <CircularProgress />

  return children({ resource, schema, onChange: setResource })
}
