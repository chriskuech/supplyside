import 'server-only'
import { readUser } from './client/user'
import { requireSession } from './session'

export const withGlobalAdmin =
  <Rest extends unknown[], Return>(fn: (...rest: Rest) => Promise<Return>) =>
  (...args: Rest): Promise<Return | undefined> =>
    requireSession()
      .then(({ accountId, userId }) => readUser(accountId, userId))
      .then((user) => (user?.isGlobalAdmin ? fn(...args) : undefined))

export const withAccountId =
  <Rest extends unknown[], Return>(
    fn: (accountId: string, ...rest: Rest) => Promise<Return>,
  ) =>
  (...args: Rest): Promise<Return> =>
    requireSession().then(({ accountId }) => fn(accountId, ...args))

export const withSessionId =
  <Rest extends unknown[], Return>(
    fn: (sessionId: string, ...rest: Rest) => Promise<Return>,
  ) =>
  (...args: Rest): Promise<Return> =>
    requireSession().then(({ id }) => fn(id, ...args))
