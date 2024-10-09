import { FastifyInstance } from 'fastify'
import { readFile } from 'fs/promises'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const mountHealth = async <App extends FastifyInstance>(app: App) =>
  app.get('/', async (request, reply) => {
    try {
      const build = await readFile(`${__dirname}/data/build.json`, 'utf-8')

      reply.send({
        timestamp: new Date().toISOString(),
        build: JSON.parse(build),
      })
    } catch (e) {
      reply.status(500).send(JSON.stringify(e, null, 2))
    }
  })
