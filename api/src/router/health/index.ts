import { FastifyInstance } from 'fastify'
import { readFile } from 'fs/promises'

export const mountHealth = async <App extends FastifyInstance>(app: App) =>
  app.get('/', async (request, reply) => {
    try {
      const build = await readFile(`${__dirname}/build.json`, 'utf-8')

      reply.send({ timestamp: new Date().toISOString(), build })
    } catch {
      reply.status(500).send('Failed to read build.json')
    }
  })
