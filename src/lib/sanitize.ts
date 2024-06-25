import { P, match } from 'ts-pattern'
import { JsonLogicValue } from '../domain/resource/json-logic/types'

export const sanitizeValue = (value: JsonLogicValue) =>
  match(value)
    .with(P.string, (s) => `'${s.replace(/'/g, "''")}'`)
    .with(P.union(P.boolean, P.number, null), (n) => String(n))
    .exhaustive()

export const sanitizeColumnName = (column: string) => {
  if (!/^[a-zA-Z0-9_]+$/.test(column)) {
    throw new Error('Invalid column name')
  }

  return `"${column}"`
}
