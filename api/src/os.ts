import { exec as execCallback } from 'child_process'
import { mkdir } from 'fs/promises'
import { inject, injectable } from 'inversify'
import { promisify } from 'util'
import { v4 as uuid } from 'uuid'
import { ConfigService } from './ConfigService'

const exec = promisify(execCallback)

@injectable()
export class OsService {
  constructor(
    @inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async exec(command: string) {
    return await exec(command)
  }

  async withTempDir<T>(fn: (path: string) => Promise<T>): Promise<T> {
    const path = `${this.configService.config.TEMP_PATH}/${uuid()}`

    try {
      await mkdir(path, { recursive: true })

      return await fn(path)
    } finally {
      await exec(`rm -rf ${path}`)
    }
  }
}
