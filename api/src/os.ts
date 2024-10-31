import { exec as execCallback } from 'child_process'
import { mkdir } from 'fs/promises'
import { inject, injectable } from 'inversify'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { promisify } from 'util'
import { v4 as uuid } from 'uuid'
import { ConfigService } from './ConfigService'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const exec = promisify(execCallback)

@injectable()
export class OsService {
  constructor(
    @inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  static async exec(command: string, timeout: number = 60_000) {
    const execing = exec(command)

    if (timeout) {
      setTimeout(() => {
        if (execing.child.exitCode === null) {
          const isKilled = execing.child.kill()
          if (!isKilled) {
            throw new Error('Failed to kill process')
          }
        }
      }, timeout)
    }

    const { stdout, stderr } = await execing

    if (execing.child.killed || stderr) {
      throw new Error(stderr)
    }

    return stdout
  }

  static get dataPath() {
    return `${__dirname}/data`
  }

  async withTempDir<T>(fn: (path: string) => Promise<T>): Promise<T> {
    const path = `${this.configService.config.TEMP_PATH}/${uuid()}`

    try {
      await mkdir(path, { recursive: true })

      return await fn(path)
    } finally {
      // await exec(`rm -rf ${path}`)
    }
  }
}
