import { RedirectType, redirect } from 'next/navigation'
import { z } from 'zod'
import { Resource, SchemaData } from '@supplyside/model'
import { CompareModalView } from './CompareModalView'
import { readFile } from '@/client/file'

type Props = {
  resource: Resource
  schemaData: SchemaData
  searchParams: Record<string, unknown>
}

export async function CompareModal({
  resource,
  schemaData,
  searchParams,
}: Props) {
  const fileId = z.string().uuid().safeParse(searchParams.compareToFileId).data

  const file = fileId ? await readFile(resource.accountId, fileId) : undefined

  async function close(path: string) {
    'use server'

    redirect(path, RedirectType.replace)
  }

  return (
    <CompareModalView
      resource={resource}
      schemaData={schemaData}
      file={file}
      isOpen={!!file}
      onClose={close}
    />
  )
}
