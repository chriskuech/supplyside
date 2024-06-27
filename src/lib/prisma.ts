import { PrismaClient } from '@prisma/client'

let _prisma: PrismaClient | null = null

const prisma = () => {
  if (!_prisma) {
    _prisma = new PrismaClient()
    _prisma.$connect()
    process.on('exit', () => _prisma?.$disconnect())
  }

  return _prisma
}

export default prisma
