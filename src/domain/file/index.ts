import { container } from 'tsyringe'
import BlobService from '../blob'
import { mapFile } from './mapValueFile'
import { fileInclude } from './model'
import { File as FileEntity } from './types'
import { PrismaService } from '@/integrations/PrismaService'

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
  const prisma = container.resolve(PrismaService)

  const { id: blobId } = await blobService.createBlob({ accountId, file })

  const fileEntity = await prisma.file.create({
    data: {
      accountId,
      blobId,
      name,
    },
    include: fileInclude,
  })

  return mapFile(fileEntity)
}
