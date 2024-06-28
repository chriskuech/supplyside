import { BlobServiceClient } from '@azure/storage-blob'
import config from './config'
import singleton from './singleton'

const azblob = singleton(() =>
  BlobServiceClient.fromConnectionString(
    config().AZURE_STORAGE_CONNECTION_STRING,
  ),
)

export default azblob
