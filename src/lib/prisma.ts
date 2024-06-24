import { PrismaClient } from '@prisma/client'
import { lazyStatic } from './lazyStatic'

export default lazyStatic(Symbol.for('prisma'), () => {
  const client = new PrismaClient()
  client.$connect()
  process.on('exit', () => client.$disconnect())

  return client
})
