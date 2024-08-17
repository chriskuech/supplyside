import { P, match } from 'ts-pattern'
import { z } from 'zod'
import { JsonLogicValue } from './types'

export const sanitizeValue = (value: JsonLogicValue) =>
  match(value)
    .with(P.string, (s) => `'${s.replace(/'/g, "''")}'`)
    .with(P.union(P.boolean, P.number, null), (n) => String(n))
    .exhaustive()

export const mapUuidToBase64 = (uuid: string) => {
  const hex = z.string().uuid().parse(uuid).replace(/-/g, '')

  return (
    'c' +
    Buffer.from(hex, 'hex')
      .toString('base64')
      .replace(/[^A-z0-9]/g, '')
  )
}

export const SESSION_LIFESPAN_IN_DAYS = 7
