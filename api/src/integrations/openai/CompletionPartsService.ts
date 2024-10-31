import { BlobService } from '@supplyside/api/domain/blob/BlobService'
import { createDataUrl } from '@supplyside/api/domain/blob/util'
import { OsService } from '@supplyside/api/os'
import { File } from '@supplyside/model'
import assert from 'assert'
import { readFile, readdir, writeFile } from 'fs/promises'
import { inject, injectable } from 'inversify'
import {
  ChatCompletionContentPart,
  ChatCompletionContentPartImage,
  ChatCompletionContentPartText,
} from 'openai/resources/index.mjs'
import { P, match } from 'ts-pattern'

@injectable()
export class CompletionPartsService {
  constructor(
    @inject(BlobService) private readonly blobService: BlobService,
    @inject(OsService) private readonly osService: OsService,
  ) {}

  mapFileToCompletionParts(file: File): Promise<ChatCompletionContentPart[]> {
    return match(file.contentType)
      .with('application/pdf', async () => await this.readPdfToBase64s(file))
      .with(P.union('image/png', 'image/jpeg', 'image/webp'), async () => [
        await this.readImageFileToBase64(file),
      ])
      .with(P.union('text/html', 'text/plain'), async () => [
        await this.readTextFileToString(file),
      ])
      .otherwise(async () => [])
  }

  private async readTextFileToString(
    file: File,
  ): Promise<ChatCompletionContentPartText> {
    const blob = await this.blobService.readBlobWithData(
      file.accountId,
      file.blobId,
    )

    assert(blob)

    return {
      type: 'text',
      text: blob.buffer.toString(),
    }
  }

  private async readImageFileToBase64(
    file: File,
  ): Promise<ChatCompletionContentPartImage> {
    const blob = await this.blobService.readBlobWithData(
      file.accountId,
      file.blobId,
    )

    return {
      type: 'image_url',
      image_url: {
        url: createDataUrl({
          contentType: file.contentType,
          buffer: blob.buffer,
        }),
        detail: 'auto',
      },
    }
  }

  private async readPdfToBase64s(
    file: File,
  ): Promise<ChatCompletionContentPartImage[]> {
    const blob = await this.blobService.readBlobWithData(
      file.accountId,
      file.blobId,
    )

    return await this.osService.withTempDir(async (containerPath) => {
      const inputPath = `${containerPath}/in.pdf`
      await writeFile(inputPath, blob.buffer)

      const outputFileNamePrefix = 'out'
      const outputPath = `${containerPath}/${outputFileNamePrefix}`
      await OsService.exec(`pdftoppm -png "${inputPath}" "${outputPath}"`)
      const containerFileNames = await readdir(containerPath)
      const base64s = await Promise.all(
        containerFileNames
          .filter((fileName) => fileName.startsWith(`${outputFileNamePrefix}-`))
          .map((pngFileName) =>
            readFile(`${containerPath}/${pngFileName}`, { encoding: 'base64' }),
          ),
      )

      return base64s.map((base64) => ({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${base64}`,
          detail: 'auto',
        },
      }))
    })
  }
}
