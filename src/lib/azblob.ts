import { BlobServiceClient } from '@azure/storage-blob'
import config from './config'

let _azblob: BlobServiceClient | null = null

const azblob = (): BlobServiceClient =>
  (_azblob ??= BlobServiceClient.fromConnectionString(
    config().AZURE_STORAGE_CONNECTION_STRING,
  ))

export default azblob
