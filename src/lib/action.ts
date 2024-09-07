'use server'

import { P, match } from 'ts-pattern'
import { enqueueSnackbar } from 'notistack'
import { readSession } from './session/actions'
import { Session } from '@/domain/iam/session/types'

export type ActionError = {
  internalMessage?: string
  externalMessage?: string
  error?: Error
  inheritanceChain?: string[]
}

export type ActionResult<T> = { data: T } | { error: ActionError }

export type ActionPromise<T> = Promise<ActionResult<T>>

export const unwrap = <T>(result: ActionResult<T>): T | undefined =>
  match(result)
    .with({ error: P.nonNullable }, ({ error }) => {
      enqueueSnackbar(error.internalMessage, { variant: 'error' })
      return undefined
    })
    .otherwise(({ data }) => data)

export const accountAction = <T>(
  fn: <P extends { session: Session }>(params: P) => Promise<T>,
): ActionPromise<T> =>
  readSession()
    .then((session) => fn({ session }))
    .then((data) => ({ data }))
    .catch((error) => ({ error: mapError(error) }))

export const systemAction = <T>(fn: () => Promise<T>): ActionPromise<T> =>
  fn()
    .then((data) => ({ data }))
    .catch((error) => ({ error: mapError(error) }))

const mapError = (error: unknown): ActionError =>
  match(error)
    .with(
      {
        code: P.optional(P.string),
        name: P.string,
        cause: P.optional(P.any),
        message: P.string,
      },
      (error) => ({
        error,
        inheritanceChain: resolveInheritanceChain(error),
      }),
    )
    .otherwise((thrownValue) => ({
      code: 'UNKNOWN',
      externalMessage: 'An unknown error occurred',
      internalMessage:
        'A non-error value was thrown: ' + JSON.stringify(thrownValue),
    }))

const resolveInheritanceChain = (object: object): string[] => [
  object.constructor.name,
  ...(Object.getPrototypeOf(object)
    ? resolveInheritanceChain(Object.getPrototypeOf(object))
    : []),
]
