import { FastifyInstance } from 'fastify'

export const mountError = async <App extends FastifyInstance>(app: App) =>
  app.get('/', (req, reply) => {
    reply.status(569).send('This route always errors')
  })
