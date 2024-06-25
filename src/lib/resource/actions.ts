'use server'

import { ResourceType } from '@prisma/client'
import { readSchema } from '@/domain/schema/actions'

type Props = {
  resourceType: ResourceType
  formData: FormData
}

export const submitForm = async ({ resourceType, formData }: Props) => {
  const schemas = await Promise.all([
    readSchema({ resourceType, isSystem: true }),
    readSchema({ resourceType, isSystem: false }),
  ])
}
