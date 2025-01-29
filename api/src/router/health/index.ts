import { FastifyInstance } from 'fastify'
import { readFile } from 'fs/promises'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const mountHealth = async <App extends FastifyInstance>(app: App) =>
  app.get('/', async () => {
    const build = await readFile(`${__dirname}/data/build.json`, 'utf-8')

    return {
      timestamp: new Date().toISOString(),
      build: JSON.parse(build),
    }
  })
