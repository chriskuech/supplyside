import { randomUUID } from 'crypto'
import { BlobServiceClient } from '@azure/storage-blob'
import { injectable } from 'inversify'
import { Blob, BlobWithData } from './entity'
import { PrismaService } from '@supplyside/api/integrations/PrismaService'
import { ConfigService } from '@supplyside/api/ConfigService'

const containerName = 'app-data'

@injectable()
export class BlobService {
  private readonly client: BlobServiceClient

  constructor(
    private readonly prisma: PrismaService,
    { config }: ConfigService
  ) {
    this.client = BlobServiceClient.fromConnectionString(
      config.AZURE_STORAGE_CONNECTION_STRING
    )
  }

  async createBlob({
    accountId,
    ...rest
  }: { accountId: string } & (
    | {
        buffer?: undefined;
        type?: undefined;
        file: File;
      }
    | {
        file?: undefined;
        buffer: Uint8Array;
        type: string;
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

    const blob = await this.prisma.blob.create({
      data: {
        accountId,
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
    accountId: string;
    blobId: string;
  }): Promise<BlobWithData | undefined> {
    const blob = await this.prisma.blob.findUnique({
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
    accountId: string;
    blobId: string;
  }): Promise<void> {
    const blob = await this.prisma.blob.findUnique({
      where: { accountId, id: blobId },
    })

    if (!blob) {
      throw new Error('Blob not found')
    }

    await this.client
      .getContainerClient(containerName)
      .getBlockBlobClient(blob.name)
      .deleteIfExists()

    await this.prisma.blob.delete({ where: { accountId, id: blobId } })
  }
}
