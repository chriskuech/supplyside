'use server'

import { isTruthy } from 'remeda'
import { withAccountId } from '@/authz'
import { createBlob } from '@/client/blob'
import { createFile } from '@/client/files'

export const uploadFile = withAccountId(
  async (accountId, formData: FormData) => {
    const fileFormData = formData.get('file')

    if (
      !fileFormData ||
      typeof fileFormData === 'string' ||
      fileFormData.size === 0
    )
      return

    const blob = await createBlob(accountId, fileFormData)

    if (!blob) return

    const file = await createFile(accountId, {
      name: fileFormData.name,
      blobId: blob.id,
    })

    return file
  },
)

export const uploadFiles = withAccountId(
  async (accountId, formData: FormData) => {
    const formDataFiles = formData.getAll('files')

    if (formDataFiles.length === 0) return

    const results = await Promise.all(
      formDataFiles
        .filter((file): file is File => typeof file !== 'string')
        .map(async (file) => {
          const blob = await createBlob(accountId, file)

          if (!blob) return

          return { name: file.name, blobId: blob.id }
        }),
    )

    // TODO: handle error
    if (results.some((results) => !results)) return

    const fileParams = results.filter(isTruthy)

    if (!fileParams.length) return

    const files = await Promise.all(
      fileParams.map((file) => createFile(accountId, file)),
    )

    return files.filter(isTruthy)
  },
)
