import { ConfigService } from '@supplyside/api/ConfigService'
import { File } from '@supplyside/model'
import assert from 'assert'
import { inject } from 'inversify'
import { match } from 'ts-pattern'
import { BlobService } from '../blob/BlobService'
import { FileService } from '../file/FileService'

export class ThumbnailRenderingService {
  constructor(
    @inject(BlobService)
    private readonly blobService: BlobService,
    @inject(ConfigService)
    private readonly configService: ConfigService,
    @inject(FileService)
    private readonly fileService: FileService,
  ) {}

  private get thumbnailBaseUrl() {
    return match(this.configService.config.SS_ENV)
      .with('development', () => 'http://localhost:8000')
      .with(
        'integration',
        () =>
          'https://supplyside-thumbnails-integration-gqeba2fgfjhjdce2.westus2-01.azurewebsites.net',
      )
      .with(
        'production',
        () =>
          'https://supplyside-thumbnails-bbcjgdbxb4cweefq.westus2-01.azurewebsites.net',
      )
      .exhaustive()
  }

  async renderThumbnail(file: File): Promise<File> {
    assert(file.contentType === 'model/step', 'File is not a step model')

    const { buffer } = await this.blobService.readBlobWithData(
      file.accountId,
      file.blobId,
    )

    const response = await fetch(`${this.thumbnailBaseUrl}/render`, {
      method: 'POST',
      body: buffer,
      headers: {
        'Content-Type': 'model/step',
      },
    })

    const thumbnailBlob = await this.blobService.createBlob(file.accountId, {
      contentType: 'image/png',
      buffer: Buffer.from(await response.arrayBuffer()),
    })

    const thumbnailFile = await this.fileService.create(file.accountId, {
      name: 'thumbnail',
      blobId: thumbnailBlob.id,
    })

    return thumbnailFile
  }
}
