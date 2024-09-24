import { randomUUID } from 'crypto'
import { singleton } from 'tsyringe'
import { BlobServiceClient } from '@azure/storage-blob'
import { Blob, BlobWithData } from './entity'
import prisma from '@/integrations/prisma'
import config from '@/integrations/config'

const containerName = 'app-data'

@singleton()
export default class BlobService {
  private readonly client: BlobServiceClient

  constructor() {
    this.client = BlobServiceClient.fromConnectionString(
      config().AZURE_STORAGE_CONNECTION_STRING,
    )
  }

  async createBlob({
    accountId,
    ...rest
  }: { accountId: string } & (
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
  )): Promise<Blob> {
    const blobName = randomUUID()

    const containerClient = this.client.getContainerClient(containerName)

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

  async readBlob({
    accountId,
    blobId,
  }: {
    accountId: string
    blobId: string
  }): Promise<BlobWithData | undefined> {
    const blob = await prisma().blob.findUnique({
      where: { accountId, id: blobId },
    })

    if (!blob) {
      throw new Error('Blob not found')
    }

    const buffer = await this.client
      .getContainerClient(containerName)
      .getBlockBlobClient(blob.name)
      .downloadToBuffer()

    return { ...blob, buffer }
  }

  async deleteBlob({
    accountId,
    blobId,
  }: {
    accountId: string
    blobId: string
  }): Promise<void> {
    const blob = await prisma().blob.findUnique({
      where: { accountId, id: blobId },
    })

    if (!blob) {
      throw new Error('Blob not found')
    }

    await this.client
      .getContainerClient(containerName)
      .getBlockBlobClient(blob.name)
      .deleteIfExists()

    await prisma().blob.delete({ where: { accountId, id: blobId } })
  }
}
