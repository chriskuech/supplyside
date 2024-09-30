import { injectable } from 'inversify'
import { BlobService } from '../blob/BlobService'
import { mapFile } from './mapValueFile'
import { fileInclude } from './model'
import { File as FileEntity } from './types'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'

@injectable()
export class FileService {
  constructor(
    private readonly blobService: BlobService,
    private readonly prisma: PrismaService
  ) {}

  async createFromBuffer(
    accountId: string,
    {
      name,
      buffer,
      contentType,
    }: {
      name: string;
      buffer: Uint8Array;
      contentType: string;
    }
  ) {
    const { id: blobId } = await this.blobService.createBlob({
      accountId,
      buffer,
      type: contentType,
    })

    const fileEntity = await this.prisma.file.create({
      data: {
        accountId,
        blobId,
        name,
      },
      include: fileInclude,
    })

    return mapFile(fileEntity)
  }

  async createFromFile(
    accountId: string,
    {
      name,
      file,
    }: {
      name: string;
      file: File;
    }
  ): Promise<FileEntity> {
    const { id: blobId } = await this.blobService.createBlob({
      accountId,
      file,
    })

    const fileEntity = await this.prisma.file.create({
      data: {
        accountId,
        blobId,
        name,
      },
      include: fileInclude,
    })

    return mapFile(fileEntity)
  }
}
