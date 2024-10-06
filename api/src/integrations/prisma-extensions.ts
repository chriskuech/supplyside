import { P, isMatching } from 'ts-pattern'

const codes = {
  notFound: ['P2025'],
} as const

export type PrismaErrorKind = keyof typeof codes

export const isPrismaError = (kind: PrismaErrorKind) =>
  isMatching({ code: P.union(...codes[kind]) })
