import assert from 'assert'
import { mkdir, readFile, readdir, rm, writeFile } from 'fs/promises'
import { exec as execCallback } from 'child_process'
import { promisify } from 'util'
import {
  ChatCompletionContentPart,
  ChatCompletionContentPartImage,
  ChatCompletionContentPartText,
} from 'openai/resources/index.mjs'
import { P, match } from 'ts-pattern'
import { container } from 'tsyringe'
import { File } from '@/domain/file/types'
import config from '@/integrations/config'
import BlobService from '@/domain/blob'

const exec = promisify(execCallback)

export const mapFileToCompletionParts = (
  file: File,
): Promise<ChatCompletionContentPart[]> =>
  match(file.contentType)
    .with('application/pdf', async () => await readPdfToBase64s(file))
    .with(P.union('image/png', 'image/jpeg', 'image/webp'), async () => [
      await readImageFileToBase64(file),
    ])
    .with(P.union('text/html', 'text/plain'), async () => [
      await readTextFileToString(file),
    ])
    .otherwise(async () => [])

const readPdfToBase64s = async (
  file: File,
): Promise<ChatCompletionContentPartImage[]> => {
  const blobService = container.resolve(BlobService)

  const blob = await blobService.readBlob({
    accountId: file.accountId,
    blobId: file.blobId,
  })

  assert(blob)

  const containerPath = `${config().TEMP_PATH}/${file.id}`
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
        detail: 'auto',
      },
    }))
  } finally {
    await rm(containerPath, { recursive: true, force: true })
  }
}

const readImageFileToBase64 = async (
  file: File,
): Promise<ChatCompletionContentPartImage> => {
  const blobService = container.resolve(BlobService)

  const blob = await blobService.readBlob({
    accountId: file.accountId,
    blobId: file.blobId,
  })

  assert(blob)

  return {
    type: 'image_url',
    image_url: {
      url: `data:${file.contentType};base64,${blob.buffer.toString('base64')}`,
      detail: 'auto',
    },
  }
}

const readTextFileToString = async (
  file: File,
): Promise<ChatCompletionContentPartText> => {
  const blobService = container.resolve(BlobService)

  const blob = await blobService.readBlob({
    accountId: file.accountId,
    blobId: file.blobId,
  })

  assert(blob)

  return {
    type: 'text',
    text: blob.buffer.toString(),
  }
}
