import { inject, injectable } from 'inversify'
import { BlobService } from '../blob/BlobService'
import { mapFile } from './mapValueFile'
import { fileInclude } from './model'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'

@injectable()
export class FileService {
  constructor(
    @inject(BlobService) private readonly blobService: BlobService,
    @inject(PrismaService) private readonly prisma: PrismaService
  ) {}

  async createFromBuffer(
    accountId: string,
    {
      name,
      buffer,
      contentType,
    }: {
      name: string;
      buffer: Buffer | ArrayBuffer;
      contentType: string;
    }
  ) {
    const { id: blobId } = await this.blobService.createBlob(accountId, {
      buffer,
      contentType,
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
