import { PrismaClient } from '@prisma/client'
import { lazyStatic } from './lazyStatic'

export default lazyStatic(Symbol.for('prisma'), () => {
  const client = new PrismaClient()
  client.$connect()
  process.on('exit', () => client.$disconnect())

  return client.$extends({
    result: {
      blob: {
        fileExtension: {
          needs: { mimeType: true },
          compute(blob) {
            return blob.mimeType.split('/').pop()
          },
        },
      },
      user: {
        fullName: {
          needs: { firstName: true, lastName: true },
          compute(user) {
            return [user.firstName, user.lastName].filter(Boolean).join(' ')
          },
        },
      },
    },
  })
})
