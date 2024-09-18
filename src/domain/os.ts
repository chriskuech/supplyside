import { promisify } from 'util'
import { exec as execCallback } from 'child_process'
import { mkdir } from 'fs/promises'
import { v4 as uuid } from 'uuid'
import config from '@/services/config'

export const withTempDir = async <T>(
  fn: (path: string) => Promise<T>,
): Promise<T> => {
  const path = `${config().TEMP_PATH}/${uuid()}`

  try {
    await mkdir(path, { recursive: true })

    return await fn(path)
  } finally {
    await exec(`rm -rf ${path}`)
  }
}

export const exec = promisify(execCallback)
