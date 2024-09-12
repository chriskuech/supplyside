import { BlobServiceClient } from '@azure/storage-blob'
import config from './config'
import singleton from './singleton'
import 'server-only'

const azblob = singleton('azblob', () =>
  BlobServiceClient.fromConnectionString(
    config().AZURE_STORAGE_CONNECTION_STRING,
  ),
)

export default azblob
