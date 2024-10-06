import assert from 'assert'
import { mkdir, readFile, readdir, rm, writeFile } from 'fs/promises'
import { exec as execCallback } from 'child_process'
import { promisify } from 'util'
import {
  ChatCompletionContentPart,
  ChatCompletionContentPartImage,
  ChatCompletionContentPartText
} from 'openai/resources/index.mjs'
import { P, match } from 'ts-pattern'
import { inject, injectable } from 'inversify'
import { BlobService } from '@supplyside/api/domain/blob/BlobService'
import { ConfigService } from '@supplyside/api/ConfigService'
import { File } from '@supplyside/model'
import { createDataUrl } from '@supplyside/api/domain/blob/util'

const exec = promisify(execCallback)

@injectable()
export class CompletionPartsService {
  constructor(
    @inject(BlobService) private readonly blobService: BlobService,
    @inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  mapFileToCompletionParts(file: File): Promise<ChatCompletionContentPart[]> {
    return match(file.contentType)
      .with('application/pdf', async () => await this.readPdfToBase64s(file))
      .with(P.union('image/png', 'image/jpeg', 'image/webp'), async () => [
        await this.readImageFileToBase64(file)
      ])
      .with(P.union('text/html', 'text/plain'), async () => [
        await this.readTextFileToString(file)
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
      text: blob.buffer.toString()
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
        url: createDataUrl({ mimeType: file.contentType, buffer: blob.buffer }),
        detail: 'auto'
      }
    }
  }

  private async readPdfToBase64s(
    file: File,
  ): Promise<ChatCompletionContentPartImage[]> {
    const blob = await this.blobService.readBlobWithData(
      file.accountId,
      file.blobId,
    )

    const containerPath = `${this.configService.config.TEMP_PATH}/${file.id}`
    await mkdir(containerPath, { recursive: true })

    try {
      const inputPath = `${containerPath}/in.pdf`
      await writeFile(inputPath, blob.buffer)

      const outputFileNamePrefix = 'out'
      const outputPath = `${containerPath}/${outputFileNamePrefix}`
      await exec(`pdftoppm -png "${inputPath}" "${outputPath}"`)
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
          detail: 'auto'
        }
      }))
    } finally {
      await rm(containerPath, { recursive: true, force: true })
    }
  }
}
