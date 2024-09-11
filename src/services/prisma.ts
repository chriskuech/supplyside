import { PrismaClient } from '@prisma/client'
import { P, isMatching } from 'ts-pattern'
import singleton from './singleton'

const codes = {
  notFound: ['P2025'],
} as const

export type PrismaErrorKind = keyof typeof codes

export const isPrismaError = (kind: PrismaErrorKind) =>
  isMatching({ code: P.union(...codes[kind]) })

const prisma = singleton('prisma', () => {
  const prisma = new PrismaClient()
  prisma.$connect()
  process.on('exit', () => prisma?.$disconnect())

  return prisma
})

export default prisma
