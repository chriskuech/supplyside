import { BlobServiceClient } from '@azure/storage-blob'
import { config } from './config'

export default BlobServiceClient.fromConnectionString(
  config.AZURE_STORAGE_CONNECTION_STRING,
)
