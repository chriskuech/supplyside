'use server'
import { revalidatePath } from 'next/cache'
import { readSession } from '@/lib/session/actions'
import {
  CreateFieldParams,
  UpdateFieldDto,
  SchemaFieldService,
} from '@/domain/schema/SchemaFieldService'
import { SchemaField } from '@/domain/schema/entity'
import { container } from '@/lib/di'

export const createField = async (params: CreateFieldParams) => {
  const session = await readSession()

  await container()
    .resolve(SchemaFieldService)
    .createField(session.accountId, params)

  revalidatePath('')
}

export const readFields = async (): Promise<SchemaField[]> => {
  const session = await readSession()

  return await container()
    .resolve(SchemaFieldService)
    .readFields(session.accountId)
}

export const updateField = async (dto: UpdateFieldDto) => {
  const session = await readSession()

  await container()
    .resolve(SchemaFieldService)
    .updateField(session.accountId, dto)

  revalidatePath('')
}

export const deleteField = async (fieldId: string) => {
  const session = await readSession()

  await container()
    .resolve(SchemaFieldService)
    .deleteField(session.accountId, fieldId)

  revalidatePath('')
}
