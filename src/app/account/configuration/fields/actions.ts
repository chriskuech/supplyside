'use server'

import { revalidatePath } from 'next/cache'
import { readSession } from '@/lib/session/actions'
import {
  createField as domainCreateField,
  readFields as domainReadFields,
  updateField as domainUpdateField,
  deleteField as domainDeleteField,
} from '@/domain/schema/fields'
import { CreateFieldParams, UpdateFieldDto } from '@/domain/schema/fields'
import { SchemaField } from '@/domain/schema/entity'

export const createField = async (params: CreateFieldParams) => {
  const session = await readSession()

  await domainCreateField(session.accountId, params)

  revalidatePath('')
}

export const readFields = async (): Promise<SchemaField[]> => {
  const session = await readSession()

  return domainReadFields(session.accountId)
}

export const updateField = async (dto: UpdateFieldDto) => {
  const session = await readSession()

  await domainUpdateField(session.accountId, dto)

  revalidatePath('')
}

export const deleteField = async (fieldId: string) => {
  const session = await readSession()

  await domainDeleteField(session.accountId, fieldId)

  revalidatePath('')
}
