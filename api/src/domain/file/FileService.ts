import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { File } from '@supplyside/model'
import { inject, injectable } from 'inversify'
import { ThumbnailRenderService } from '../blob/ThumbnailRenderService'
import { mapFile } from './mapValueFile'
import { fileInclude } from './model'

@injectable()
export class FileService {
  constructor(
    @inject(PrismaService) private readonly prisma: PrismaService,
    @inject(ThumbnailRenderService)
    private readonly thumbnailRenderService: ThumbnailRenderService,
  ) {}

  async create(
    accountId: string,
    data: { name: string; blobId: string },
  ): Promise<File> {
    let model = await this.prisma.file.create({
      data: {
        accountId,
        blobId: data.blobId,
        name: data.name,
      },
      include: fileInclude,
    })

    if (model.Blob.contentType === 'model/step') {
      const thumbnailBlob =
        await this.thumbnailRenderService.renderStepBlobToPng(
          accountId,
          data.blobId,
        )
      model = await this.prisma.file.update({
        where: { id: model.id },
        data: { thumbnailBlobId: thumbnailBlob.id },
        include: fileInclude,
      })
    }

    return mapFile(model)
  }

  async read(accountId: string, fileId: string): Promise<File> {
    const model = await this.prisma.file.findUniqueOrThrow({
      where: { accountId, id: fileId },
      include: fileInclude,
    })

    return mapFile(model)
  }
}
