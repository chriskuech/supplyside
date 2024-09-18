import assert from 'assert'
import { readFile, readdir, writeFile } from 'fs/promises'
import { exec as execCallback } from 'child_process'
import { promisify } from 'util'
import {
  ChatCompletionContentPart,
  ChatCompletionContentPartImage,
  ChatCompletionContentPartText,
} from 'openai/resources/index.mjs'
import { P, match } from 'ts-pattern'
import { File } from '../files/types'
import { readBlob } from '../blobs'
import { withTempDir } from '../os'

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
  const blob = await readBlob({
    accountId: file.accountId,
    blobId: file.blobId,
  })

  assert(blob)

  return await withTempDir(async (path) => {
    const inputPath = `${path}/in.pdf`
    const outputFileNamePrefix = 'out'
    const outputPath = `${path}/${outputFileNamePrefix}`

    await writeFile(inputPath, blob.buffer)

    await exec(`pdftoppm -png "${inputPath}" "${outputPath}"`)

    const containerFileNames = await readdir(path)

    const base64s = await Promise.all(
      containerFileNames
        .filter((fileName) => fileName.startsWith(`${outputFileNamePrefix}-`))
        .map((pngFileName) =>
          readFile(`${path}/${pngFileName}`, { encoding: 'base64' }),
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

const readImageFileToBase64 = async (
  file: File,
): Promise<ChatCompletionContentPartImage> => {
  const blob = await readBlob({
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
  const blob = await readBlob({
    accountId: file.accountId,
    blobId: file.blobId,
  })

  assert(blob)

  return {
    type: 'text',
    text: blob.buffer.toString(),
  }
}
