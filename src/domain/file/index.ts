import { container } from 'tsyringe'
import BlobService from '../blob'
import { mapFile } from './mapValueFile'
import { fileInclude } from './model'
import { File as FileEntity } from './types'
import prisma from '@/integrations/prisma'

type CreateFileParams = {
  accountId: string
  name: string
  file: File
}

export const createFile = async ({
  accountId,
  name,
  file,
}: CreateFileParams): Promise<FileEntity> => {
  const blobService = container.resolve(BlobService)

  const { id: blobId } = await blobService.createBlob({ accountId, file })

  const fileEntity = await prisma().file.create({
    data: {
      accountId,
      blobId,
      name,
    },
    include: fileInclude,
  })

  return mapFile(fileEntity)
}
