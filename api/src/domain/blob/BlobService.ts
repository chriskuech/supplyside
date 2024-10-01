import { randomUUID } from 'crypto'
import { BlobServiceClient } from '@azure/storage-blob'
import { inject, injectable } from 'inversify'
import { Blob, BlobWithData } from './entity'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { ConfigService } from '@supplyside/api/ConfigService'

const containerName = 'app-data'

@injectable()
export class BlobService {
  private readonly client: BlobServiceClient

  constructor(
    @inject(PrismaService) private readonly prisma: PrismaService,
    @inject(ConfigService) { config }: ConfigService
  ) {
    this.client = BlobServiceClient.fromConnectionString(
      config.AZURE_STORAGE_CONNECTION_STRING
    )
  }

  async createBlob(
    accountId: string,
    data: {
      buffer: Buffer;
      contentType: string;
    }
  ): Promise<Blob> {
    const blobName = randomUUID()
    const contentType = data.contentType.toLowerCase()

    const containerClient = this.client.getContainerClient(containerName)

    await containerClient.createIfNotExists()

    await containerClient.getBlockBlobClient(blobName).uploadData(data.buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    })

    const blob = await this.prisma.blob.create({
      data: {
        accountId,
        mimeType: contentType,
        name: blobName,
      },
    })

    return blob
  }

  async readBlob(accountId: string, blobId: string): Promise<Blob> {
    return await this.prisma.blob.findUniqueOrThrow({
      where: { accountId, id: blobId },
    })
  }

  async readBlobWithData(
    accountId: string,
    blobId: string
  ): Promise<BlobWithData> {
    const blob = await this.prisma.blob.findUniqueOrThrow({
      where: { accountId, id: blobId },
    })

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
    accountId: string;
    blobId: string;
  }): Promise<void> {
    const blob = await this.prisma.blob.findUniqueOrThrow({
      where: { accountId, id: blobId },
    })

    await this.client
      .getContainerClient(containerName)
      .getBlockBlobClient(blob.name)
      .deleteIfExists()

    await this.prisma.blob.delete({ where: { accountId, id: blobId } })
  }
}
