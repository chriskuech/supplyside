'use server'

import { fail } from 'assert'
import { isTruthy } from 'remeda'
import { z } from 'zod'
import { File as FileModel } from '@supplyside/model'
import { withAccountId } from '@/authz'
import { createBlob } from '@/client/blob'
import { createFile, createFileToken, readFile } from '@/client/file'
import { config } from '@/config'

const handleFileUpload = async (accountId: string, jsFile: File) => {
  const blob = await createBlob(accountId, jsFile)
  if (!blob) return

  const file = await createFile(accountId, {
    name: jsFile.name,
    blobId: blob.id,
  })

  return file
}

export const uploadFile = withAccountId(
  async (accountId, formData: FormData): Promise<FileModel | undefined> => {
    const jsFile = z.instanceof(File).parse(formData.get('file'))

    return handleFileUpload(accountId, jsFile)
  },
)

export const uploadFiles = withAccountId(
  async (accountId, formData: FormData): Promise<FileModel[] | undefined> => {
    const jsFiles = z.array(z.instanceof(File)).parse(formData.getAll('files'))

    const files = await Promise.all(
      jsFiles.map((jsFile) => handleFileUpload(accountId, jsFile)),
    )

    return files.filter(isTruthy)
  },
)

export const getCadPreviewUrl = withAccountId(
  async (accountId: string, fileId: string) => {
    const [file, { token }] = await Promise.all([
      readFile(accountId, fileId).then((e) => e ?? fail('File not found')),
      createFileToken(accountId, fileId).then(
        (e) => e ?? fail('Token not found'),
      ),
    ])

    const tokenDownloadUrl = `${config().API_BASE_URL}/integrations/files/download/${file.name}?token=${token}`

    return `https://3dviewer.net/#model=${tokenDownloadUrl}`
  },
)
