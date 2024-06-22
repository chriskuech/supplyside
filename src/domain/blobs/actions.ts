'use server'

import { randomUUID } from 'crypto'
import { Blob } from '@prisma/client'
import azblob from '@/lib/azblob'
import prisma from '@/lib/prisma'

const containerName = 'app-data'

export type FileDto = {
  name: string
  type: string
  buffer: ArrayBuffer
}

type CreateBlobParams = {
  accountId: string
  file: FileDto
}

export const createBlob = async ({ accountId, file }: CreateBlobParams) => {
  const blobName = randomUUID()

  const containerClient = azblob.getContainerClient(containerName)

  await containerClient.createIfNotExists()

  await containerClient.getBlockBlobClient(blobName).uploadData(file.buffer, {
    blobHTTPHeaders: { blobContentType: file.type },
  })

  const blob = await prisma.blob.create({
    data: {
      accountId: accountId,
      mimeType: file.type.toLowerCase(),
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
}: ReadBlobParams): Promise<(Blob & { buffer: Buffer }) | undefined> => {
  const blob = await prisma.blob.findUnique({
    where: { accountId, id: blobId },
  })
  if (!blob) {
    throw new Error('Blob not found')
  }

  const buffer = await azblob
    .getContainerClient(containerName)
    .getBlockBlobClient(blob.name)
    .downloadToBuffer()

  return { ...blob, buffer }
}

type DeleteBlobParams = {
  accountId: string
  blobId: string
}

export const deleteBlob = async ({ accountId, blobId }: DeleteBlobParams) => {
  const blob = await prisma.blob.findUnique({
    where: { accountId, id: blobId },
  })

  if (!blob) {
    throw new Error('Blob not found')
  }

  await azblob
    .getContainerClient(containerName)
    .getBlockBlobClient(blob.name)
    .deleteIfExists()

  await prisma.blob.delete({ where: { accountId, id: blobId } })
}
