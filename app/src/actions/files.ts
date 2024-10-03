'use server'

import { isTruthy } from 'remeda'
import { z } from 'zod'
import { File as FileModel } from '@supplyside/model'
import { withAccountId } from '@/authz'
import { createBlob } from '@/client/blob'
import { createFile } from '@/client/files'

export const uploadFile = withAccountId(
  async (accountId, formData: FormData): Promise<FileModel | undefined> => {
    const jsFile = z.instanceof(File).parse(formData.get('file'))

    const blob = await createBlob(accountId, jsFile)
    if (!blob) return

    const file = await createFile(accountId, {
      name: jsFile.name,
      blobId: blob.id,
    })

    return file
  },
)

export const uploadFiles = withAccountId(
  async (accountId, formData: FormData): Promise<FileModel[] | undefined> => {
    const jsFiles = z.array(z.instanceof(File)).parse(formData.getAll('files'))

    const files = await Promise.all(
      jsFiles.map(async (jsFile) => {
        const blob = await createBlob(accountId, jsFile)
        if (!blob) return

        const file = await createFile(accountId, {
          name: jsFile.name,
          blobId: blob.id,
        })
        if (!file) return

        return file
      }),
    )

    return files.filter(isTruthy)
  },
)
