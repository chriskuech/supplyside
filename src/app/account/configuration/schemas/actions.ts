'use server'
import { ResourceType } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { readSession } from '@/lib/session/actions'
import { SchemaSectionService } from '@/domain/schema/SchemaSectionService'
import { SchemaService } from '@/domain/schema/SchemaService'
import { container } from '@/lib/di'

export type Field = {
  id: string
  name: string
  templateId: string | null
}

export type Section = {
  id: string
  name: string
  SectionField: { Field: Field }[]
}

export type Schema = {
  id: string
  resourceType: ResourceType
  Section: Section[]
}

export const readSchemas = async (): Promise<Schema[]> => {
  const { accountId } = await readSession()

  return await container().resolve(SchemaService).readSchemas(accountId)
}

export const updateSchema = async (dto: {
  schemaId: string
  sectionIds: string[]
}) => {
  const { accountId } = await readSession()

  await container()
    .resolve(SchemaSectionService)
    .updateSchema(accountId, dto.schemaId, dto.sectionIds)

  revalidatePath('')
}

export const createSection = async (dto: {
  schemaId: string
  name: string
}) => {
  // TODO: this is missing accountId

  await container().resolve(SchemaSectionService).createSection(dto)

  revalidatePath('')
}

export const updateSection = async (dto: {
  sectionId: string
  name: string
  fieldIds: string[]
}) => {
  const { accountId } = await readSession()

  await container()
    .resolve(SchemaSectionService)
    .updateSection({ accountId, ...dto })

  revalidatePath('')
}

export const deleteSection = async (sectionId: string) => {
  const { accountId } = await readSession()

  await container()
    .resolve(SchemaSectionService)
    .deleteSection(accountId, sectionId)

  revalidatePath('')
}
