import { PrismaClient } from '@prisma/client'

// Mitigate local dev hot reload not cleaning up prisma connections
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const gbl = global as any

if (!gbl.prisma) {
  gbl.prisma = new PrismaClient()
  gbl.prisma.$connect()
  process.on('exit', () => gbl.prisma.$disconnect())
}

export default gbl.prisma
