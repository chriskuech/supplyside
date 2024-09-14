import { PrismaClient } from '@prisma/client'
import singleton from './singleton'
import '@/server-only'

const prisma = singleton('prisma', () => {
  const prisma = new PrismaClient()
  prisma.$connect()
  process.on('exit', () => prisma?.$disconnect())

  return prisma
})

export default prisma
