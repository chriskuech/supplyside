import { randomUUID } from 'crypto'
import { Blob, BlobWithData } from './entity'
import azblob from '@/integrations/azblob'
import prisma from '@/integrations/prisma'

const containerName = 'app-data'

type CreateBlobParams = { accountId: string } & (
  | {
      buffer?: undefined
      type?: undefined
      file: File
    }
  | {
      file?: undefined
      buffer: Uint8Array
      type: string
    }
)

export const createBlob = async ({
  accountId,
  ...rest
}: CreateBlobParams): Promise<Blob> => {
  const blobName = randomUUID()

  const containerClient = azblob().getContainerClient(containerName)

  await containerClient.createIfNotExists()

  const buffer = rest.buffer ?? (await rest.file.arrayBuffer())
  const type = rest.type ?? rest.file.type

  await containerClient
    .getBlockBlobClient(blobName)
    .uploadData(buffer, { blobHTTPHeaders: { blobContentType: type } })

  const blob = await prisma().blob.create({
    data: {
      accountId: accountId,
      mimeType: type.toLowerCase(),
      name: blobName,
    },
  })

  return blob
}

type ReadBlobParams = {
  accountId: string
  blobId: string
}

export const readBlob = async ({
  accountId,
  blobId,
}: ReadBlobParams): Promise<BlobWithData | undefined> => {
  const blob = await prisma().blob.findUnique({
    where: { accountId, id: blobId },
  })

  if (!blob) {
    throw new Error('Blob not found')
  }

  const buffer = await azblob()
    .getContainerClient(containerName)
    .getBlockBlobClient(blob.name)
    .downloadToBuffer()

  return { ...blob, buffer }
}

type DeleteBlobParams = {
  accountId: string
  blobId: string
}

export const deleteBlob = async ({
  accountId,
  blobId,
}: DeleteBlobParams): Promise<void> => {
  const blob = await prisma().blob.findUnique({
    where: { accountId, id: blobId },
  })

  if (!blob) {
    throw new Error('Blob not found')
  }

  await azblob()
    .getContainerClient(containerName)
    .getBlockBlobClient(blob.name)
    .deleteIfExists()

  await prisma().blob.delete({ where: { accountId, id: blobId } })
}
