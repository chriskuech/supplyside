import { readUser } from './client/user'
import { readSession } from './session'

export const withGlobalAdmin =
  <Rest extends unknown[], Return>(fn: (...rest: Rest) => Promise<Return>) =>
  (...args: Rest): Promise<Return | undefined> =>
    readSession()
      .then(({ accountId, userId }) => readUser(accountId, userId))
      .then((user) => (user?.isGlobalAdmin ? fn(...args) : undefined))

export const withAccountId =
  <Rest extends unknown[], Return>(
    fn: (accountId: string, ...rest: Rest) => Promise<Return>,
  ) =>
  (...args: Rest): Promise<Return> =>
    readSession().then(({ accountId }) => fn(accountId, ...args))

export const withSessionId =
  <Rest extends unknown[], Return>(
    fn: (sessionId: string, ...rest: Rest) => Promise<Return>,
  ) =>
  (...args: Rest): Promise<Return> =>
    readSession().then(({ id }) => fn(id, ...args))
