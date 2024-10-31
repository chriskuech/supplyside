import { OsService } from '@supplyside/api/os'
import { FastifyInstance } from 'fastify'
import { readFile } from 'fs/promises'

export const mountHealth = async <App extends FastifyInstance>(app: App) =>
  app.get('/', async () => {
    const build = await readFile(`${OsService.dataPath}/build.json`, 'utf-8')

    return {
      timestamp: new Date().toISOString(),
      build: JSON.parse(build),
    }
  })
