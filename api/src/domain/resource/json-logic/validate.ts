import { Schema } from '@supplyside/model'
import { concat, filter, pipe, unique } from 'remeda'
import { P, match } from 'ts-pattern'
import { JsonLogic, OrderBy } from './types'

export const getInvalidVars = ({
  schema,
  where,
  orderBy,
}: {
  schema: Schema
  where?: JsonLogic
  orderBy?: OrderBy[]
}): string[] => {
  const expected = new Set(schema.fields.map((f) => f.name))

  return pipe(
    [],
    concat(orderBy ? extractVarsFromOrderBy(orderBy) : []),
    concat(where ? extractVarsFromWhere(where) : []),
    unique(),
    filter((var_) => !expected.has(var_)),
  )
}

const extractVarsFromWhere = (where: JsonLogic): string[] =>
  match(where)
    .with({ and: P.any }, ({ and: clauses }) =>
      clauses.flatMap(extractVarsFromWhere),
    )
    .with({ or: P.any }, ({ or: clauses }) =>
      clauses.flatMap(extractVarsFromWhere),
    )
    .with({ '==': P.any }, ({ '==': [{ var: var_ }] }) => [var_])
    .with({ '!=': P.any }, ({ '!=': [{ var: var_ }] }) => [var_])
    .exhaustive()

const extractVarsFromOrderBy = (orderBy: OrderBy[]): string[] =>
  orderBy.map((o) => o.var)
